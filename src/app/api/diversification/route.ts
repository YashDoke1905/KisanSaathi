import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  rankSideBusinesses,
  calculateIntegratedCashFlow,
  FarmerDiversificationProfile,
} from "@/engine/diversification";
import { VERIFIED_SIDE_BUSINESSES, SideBusinessDef } from "@/data/sideBusinesses";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const budgetParam = searchParams.get("budget");
    const categoryParam = searchParams.get("category");
    const enterpriseIdParam = searchParams.get("enterpriseId");

    let user = await getCurrentUser();
    if (!user) {
      user = (await prisma.user.findUnique({
        where: { username: "demo" },
        include: {
          profile: {
            include: {
              farms: {
                include: {
                  waterSources: true,
                  cropPlans: { include: { crop: true } },
                },
              },
            },
          },
        },
      })) as any;
    }

    const profileData = user?.profile;
    const farms = profileData?.farms || [];

    // Extract crops grown
    const cropsSet = new Set<string>();
    let hasFarmPond = false;
    let waterAvail: "Scare_Drought" | "Moderate_Well" | "Abundant_Canal" | "Farm_Pond" =
      "Moderate_Well";

    farms.forEach((f: any) => {
      f.cropPlans?.forEach((cp: any) => {
        if (cp.cropId) cropsSet.add(cp.cropId.toLowerCase());
      });
      f.waterSources?.forEach((ws: any) => {
        if (ws.sourceType === "Farm_Pond") {
          hasFarmPond = true;
          waterAvail = "Farm_Pond";
        } else if (ws.sourceType === "Canal") {
          waterAvail = "Abundant_Canal";
        } else if (ws.sourceType === "Rainfed" && waterAvail !== "Abundant_Canal") {
          waterAvail = "Scare_Drought";
        }
      });
    });

    if (cropsSet.size === 0) {
      cropsSet.add("soybean");
      cropsSet.add("cotton");
      cropsSet.add("onion");
    }

    const availableBudget = budgetParam
      ? Math.max(5000, parseFloat(budgetParam))
      : profileData?.budgetCapacity || 100000;

    const farmerProfile: FarmerDiversificationProfile = {
      availableBudget,
      dailyLabourHoursAvailable: 2.5,
      waterAvailability: waterAvail,
      district: profileData?.district || "Nashik",
      currentCropsGrown: Array.from(cropsSet),
      hasFarmPond,
    };

    // Calculate ranking
    let ranked = rankSideBusinesses(farmerProfile, VERIFIED_SIDE_BUSINESSES);

    // Apply category filter if requested
    if (categoryParam && categoryParam !== "all") {
      ranked = ranked.filter((r) => r.enterprise.category === categoryParam);
    }

    // Select enterprise for integrated cash flow
    let chosenEnterprise: SideBusinessDef = ranked[0]?.enterprise || VERIFIED_SIDE_BUSINESSES[0];
    if (enterpriseIdParam) {
      const found = VERIFIED_SIDE_BUSINESSES.find((e) => e.id === enterpriseIdParam);
      if (found) chosenEnterprise = found;
    }

    // Integrated cash flow analysis
    const integratedPlan = calculateIntegratedCashFlow(
      85000, // baseline crop profit
      65000, // baseline crop cost
      chosenEnterprise
    );

    // Budget summary indicators
    const lowestSetupEnterprise = [...VERIFIED_SIDE_BUSINESSES].sort(
      (a, b) => a.setupCost - b.setupCost
    )[0];
    const highestMonthlyEarner = [...VERIFIED_SIDE_BUSINESSES].sort(
      (a, b) => b.expectedMonthlyProfit - a.expectedMonthlyProfit
    )[0];
    const fastestPayback = [...VERIFIED_SIDE_BUSINESSES].sort(
      (a, b) => a.paybackPeriodMonths - b.paybackPeriodMonths
    )[0];

    return NextResponse.json({
      success: true,
      farmerProfile,
      rankedEnterprises: ranked,
      integratedPlan,
      quickHighlights: {
        lowestSetupEnterprise,
        highestMonthlyEarner,
        fastestPayback,
        totalEnterprisesCount: VERIFIED_SIDE_BUSINESSES.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/diversification error:", error);
    return NextResponse.json(
      { error: "Failed to load diversification models", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const customProfile: FarmerDiversificationProfile = {
      availableBudget:
        typeof body.availableBudget === "number" ? body.availableBudget : 100000,
      dailyLabourHoursAvailable:
        typeof body.dailyLabourHoursAvailable === "number"
          ? body.dailyLabourHoursAvailable
          : 2.0,
      waterAvailability: body.waterAvailability || "Moderate_Well",
      district: body.district || "Maharashtra",
      currentCropsGrown: Array.isArray(body.currentCropsGrown)
        ? body.currentCropsGrown
        : ["soybean", "cotton"],
      hasFarmPond: Boolean(body.hasFarmPond),
    };

    const ranked = rankSideBusinesses(customProfile, VERIFIED_SIDE_BUSINESSES);

    let targetEnterprise = ranked[0]?.enterprise || VERIFIED_SIDE_BUSINESSES[0];
    if (body.targetEnterpriseId) {
      const found = VERIFIED_SIDE_BUSINESSES.find((e) => e.id === body.targetEnterpriseId);
      if (found) targetEnterprise = found;
    }

    const integratedPlan = calculateIntegratedCashFlow(
      typeof body.annualCropProfit === "number" ? body.annualCropProfit : 85000,
      typeof body.cropCultivationCost === "number" ? body.cropCultivationCost : 65000,
      targetEnterprise
    );

    return NextResponse.json({
      success: true,
      simulatedProfile: customProfile,
      rankedEnterprises: ranked,
      integratedPlan,
    });
  } catch (error: any) {
    console.error("POST /api/diversification error:", error);
    return NextResponse.json(
      { error: "Simulation failed", details: error?.message },
      { status: 500 }
    );
  }
}
