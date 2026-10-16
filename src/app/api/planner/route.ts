import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCropPlan, generatePlanTasks } from "@/engine";
import { getCropData } from "@/data/crops";

// GET /api/planner - List all crop plans for the active user
export async function GET(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      // Fallback to demo farmer for seamless offline/local use
      user = await prisma.user.findUnique({
        where: { username: "demo" },
        include: {
          profile: {
            include: {
              farms: {
                include: {
                  waterSources: true,
                },
              },
            },
          },
        },
      }) as any;
    }

    if (!user?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const farmIds = user.profile.farms.map((f: any) => f.id);

    const plans = await prisma.cropPlan.findMany({
      where: {
        farmId: { in: farmIds },
      },
      include: {
        farm: true,
        crop: true,
        tasks: {
          orderBy: { dueDate: "asc" },
        },
        expenses: true,
        incomes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedPlans = plans.map((plan) => {
      const cropData = getCropData(plan.cropId);
      const totalTasks = plan.tasks.length;
      const completedTasks = plan.tasks.filter((t) => t.isCompleted).length;
      const progressPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Find upcoming pending task
      const upcomingTask = plan.tasks.find((t) => !t.isCompleted);

      return {
        ...plan,
        cropDetails: cropData,
        stats: {
          totalTasks,
          completedTasks,
          progressPercent,
          upcomingTask,
        },
      };
    });

    return NextResponse.json({ plans: enrichedPlans });
  } catch (error) {
    console.error("GET /api/planner error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crop plans" },
      { status: 500 }
    );
  }
}

// POST /api/planner - Create a new crop plan
export async function POST(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: "demo" },
        include: {
          profile: {
            include: { farms: true },
          },
        },
      }) as any;
    }

    if (!user?.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let {
      farmId,
      cropId = "onion",
      varietyId,
      areaAcre = 2.0,
      sowingDate,
      irrigationMethod = "drip",
      soilType = "Medium_Black",
      customCosts,
      customPricePerQuintal,
      customYieldQuintalsPerAcre,
    } = body;

    // Default sowing date if omitted
    if (!sowingDate) {
      sowingDate = new Date().toISOString().split("T")[0];
    }

    // Resolve or auto-create a farm plot so the plan creation never crashes
    let farm = null;
    if (farmId && farmId !== "custom") {
      farm = await prisma.farm.findFirst({
        where: {
          id: farmId,
          farmerId: user.profile.id,
        },
      });
    }

    // If farmId was custom or not found, locate any farm owned by this farmer
    if (!farm) {
      farm = await prisma.farm.findFirst({
        where: {
          farmerId: user.profile.id,
        },
      });
    }

    // If farmer has no farm record at all, auto-create a default plot
    if (!farm) {
      farm = await prisma.farm.create({
        data: {
          farmerId: user.profile.id,
          name: "माझे शेत (गट क्र. ४२)",
          surveyNumber: "गट क्र. ४२/१",
          areaAcre: Number(areaAcre) || 2.5,
          soilType: soilType || "Medium_Black",
          ownershipType: "owned",
          waterSources: {
            create: {
              sourceType: "Open_Well",
              hasDrip: irrigationMethod === "drip",
              hasSprinkler: irrigationMethod === "sprinkler",
            },
          },
        },
      });
    }

    const resolvedFarmId = farm.id;

    // Run the pure calculation engine
    const calc = calculateCropPlan({
      cropId,
      varietyId,
      areaAcre: Number(areaAcre),
      sowingDate,
      irrigationMethod,
      soilType: farm.soilType || soilType,
      customCosts,
      customPricePerQuintal,
      customYieldQuintalsPerAcre,
    });

    const sowingDateObj = new Date(sowingDate);
    const harvestDateObj = new Date(calc.harvestDate);

    // Save CropPlan record
    const plan = await prisma.cropPlan.create({
      data: {
        farmId: resolvedFarmId,
        cropId,
        areaAcre: Number(areaAcre),
        sowingDate: sowingDateObj,
        harvestDate: harvestDateObj,
        irrigationMethod,
        status: "active",
        estTotalCost: calc.totalCost,
        estExpectedYield: calc.totalExpectedYieldQuintals,
        estExpectedPrice: calc.effectivePricePerQuintal,
        estGrossRevenue: calc.grossRevenue,
        estNetProfit: calc.netProfit,
      },
    });

    // Auto-generate dated tasks
    const generatedTasks = generatePlanTasks(cropId, sowingDateObj, Number(areaAcre));
    for (const t of generatedTasks) {
      await prisma.planTask.create({
        data: {
          planId: plan.id,
          dueDate: t.dueDate,
          titleEn: t.titleEn,
          titleMr: t.titleMr,
          titleHi: t.titleHi,
          category: t.category,
          quantityDesc: t.descriptionMr,
          isCompleted: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      planId: plan.id,
      calculation: calc,
    });
  } catch (error) {
    console.error("POST /api/planner error:", error);
    return NextResponse.json(
      { error: "Failed to create crop plan" },
      { status: 500 }
    );
  }
}
