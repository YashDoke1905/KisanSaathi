import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/ledger - Retrieve farmer's complete Khata Diary (expenses + incomes)
export async function GET(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      user = (await prisma.user.findUnique({
        where: { username: "demo" },
        include: {
          profile: {
            include: { farms: true },
          },
        },
      })) as any;
    }

    if (!user?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const farmIds = user.profile.farms.map((f: any) => f.id);

    // Fetch all expenses and incomes across farmer's lands
    const [expenses, incomes, plans] = await Promise.all([
      prisma.expense.findMany({
        where: { farmId: { in: farmIds } },
        include: {
          farm: true,
          plan: {
            include: { crop: true },
          },
        },
        orderBy: { expenseDate: "desc" },
      }),
      prisma.income.findMany({
        where: { farmId: { in: farmIds } },
        include: {
          farm: true,
          plan: {
            include: { crop: true },
          },
        },
        orderBy: { saleDate: "desc" },
      }),
      prisma.cropPlan.findMany({
        where: { farmId: { in: farmIds } },
        include: { crop: true },
      }),
    ]);

    // Financial aggregates
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.totalAmount, 0);
    const netBalance = totalIncome - totalExpense;

    // Categorized expense breakdown
    const expensesByCategory: Record<string, number> = {
      Fertilizer: 0,
      Seed: 0,
      Pesticide: 0,
      Labour: 0,
      Machinery: 0,
      Irrigation: 0,
      Other: 0,
    };

    for (const exp of expenses) {
      const cat = exp.category || "Other";
      if (expensesByCategory[cat] !== undefined) {
        expensesByCategory[cat] += exp.amount;
      } else {
        expensesByCategory["Other"] = (expensesByCategory["Other"] || 0) + exp.amount;
      }
    }

    // Combine transactions into unified date-sorted feed
    const transactions = [
      ...expenses.map((e) => ({
        id: e.id,
        type: "expense" as const,
        date: e.expenseDate.toISOString(),
        category: e.category,
        amount: e.amount,
        notes: e.notes,
        farmName: e.farm?.name || "शेत",
        cropId: e.plan?.cropId || null,
        cropNameMr: e.plan?.crop?.nameMr || null,
        cropNameEn: e.plan?.crop?.nameEn || null,
        planId: e.planId,
      })),
      ...incomes.map((i) => ({
        id: i.id,
        type: "income" as const,
        date: i.saleDate.toISOString(),
        category: "Crop_Sale",
        amount: i.totalAmount,
        notes: i.mandiName ? `विक्री: ${i.mandiName}` : "शेतमाल विक्री",
        farmName: i.farm?.name || "शेत",
        cropId: i.plan?.cropId || null,
        cropNameMr: i.plan?.crop?.nameMr || null,
        cropNameEn: i.plan?.crop?.nameEn || null,
        planId: i.planId,
        quantityQuintal: i.quantityQuintal,
        ratePerQuintal: i.ratePerQuintal,
        mandiName: i.mandiName,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      summary: {
        totalExpense,
        totalIncome,
        netBalance,
        expensesByCategory,
      },
      transactions,
      plans: plans.map((p) => ({
        id: p.id,
        cropId: p.cropId,
        cropNameMr: p.crop?.nameMr || p.cropId,
        cropNameEn: p.crop?.nameEn || p.cropId,
        areaAcre: p.areaAcre,
        status: p.status,
      })),
      farms: user.profile.farms,
    });
  } catch (error) {
    console.error("GET /api/ledger error:", error);
    return NextResponse.json({ error: "Failed to load ledger data" }, { status: 500 });
  }
}

// POST /api/ledger - Record a new Expense or Income in the farmer's Diary
export async function POST(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      user = (await prisma.user.findUnique({
        where: { username: "demo" },
        include: {
          profile: {
            include: { farms: true },
          },
        },
      })) as any;
    }

    if (!user?.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type = "expense",
      amount,
      category = "Other",
      date,
      notes,
      planId,
      farmId,
      quantityQuintal,
      ratePerQuintal,
      mandiName,
    } = body;

    const q = Number(quantityQuintal || 0);
    const r = Number(ratePerQuintal || 0);
    const numAmount = Number(amount) || (q * r);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: "Valid positive amount is required" }, { status: 400 });
    }

    // Determine target farm
    let targetFarmId = farmId;
    if (planId) {
      const plan = await prisma.cropPlan.findUnique({ where: { id: planId } });
      if (plan) {
        targetFarmId = plan.farmId;
      }
    }

    if (!targetFarmId) {
      // Find first user farm or create default
      let farm = await prisma.farm.findFirst({
        where: { farmerId: user.profile.id },
      });
      if (!farm) {
        farm = await prisma.farm.create({
          data: {
            farmerId: user.profile.id,
            name: "माझे मुख्य शेत (Gat 42)",
            surveyNumber: "गट क्र. ४२/१",
            areaAcre: 2.5,
            soilType: "Medium_Black",
            ownershipType: "owned",
          },
        });
      }
      targetFarmId = farm.id;
    }

    const entryDate = date ? new Date(date) : new Date();

    if (type === "expense") {
      const expense = await prisma.expense.create({
        data: {
          planId: planId || null,
          farmId: targetFarmId,
          expenseDate: entryDate,
          category,
          amount: numAmount,
          notes: notes || null,
        },
      });

      // Update actual cost on cropPlan if tied to a plan
      if (planId) {
        const allPlanExpenses = await prisma.expense.aggregate({
          where: { planId },
          _sum: { amount: true },
        });
        await prisma.cropPlan.update({
          where: { id: planId },
          data: { actualTotalCost: allPlanExpenses._sum.amount || 0 },
        });
      }

      return NextResponse.json({ success: true, entry: expense, type: "expense" });
    } else if (type === "income") {
      const q = Number(quantityQuintal || 0);
      const r = Number(ratePerQuintal || 0);
      const total = numAmount || (q * r);

      const income = await prisma.income.create({
        data: {
          planId: planId || null,
          farmId: targetFarmId,
          saleDate: entryDate,
          quantityQuintal: q,
          ratePerQuintal: r,
          totalAmount: total,
          mandiName: mandiName || null,
        },
      });

      // Update actual sold price on cropPlan if tied to a plan
      if (planId) {
        const allPlanIncomes = await prisma.income.aggregate({
          where: { planId },
          _sum: { totalAmount: true },
        });
        await prisma.cropPlan.update({
          where: { id: planId },
          data: { actualSoldPrice: allPlanIncomes._sum.totalAmount || 0 },
        });
      }

      return NextResponse.json({ success: true, entry: income, type: "income" });
    }

    return NextResponse.json({ error: "Invalid ledger entry type" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/ledger error:", error);
    return NextResponse.json({ error: "Failed to record entry" }, { status: 500 });
  }
}

// DELETE /api/ledger?id=...&type=expense|income
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "Missing entry id or type" }, { status: 400 });
    }

    if (type === "expense") {
      await prisma.expense.delete({ where: { id } });
    } else if (type === "income") {
      await prisma.income.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "Entry deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/ledger error:", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
