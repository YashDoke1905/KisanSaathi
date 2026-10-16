import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCropPlan, calculateIrrigationRequirements } from "@/engine";
import { getCropData } from "@/data/crops";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const plan = await prisma.cropPlan.findUnique({
      where: { id: planId },
      include: {
        farm: true,
        crop: true,
        tasks: {
          orderBy: { dueDate: "asc" },
        },
        expenses: {
          orderBy: { expenseDate: "desc" },
        },
        incomes: {
          orderBy: { saleDate: "desc" },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Crop plan not found" }, { status: 404 });
    }

    const cropData = getCropData(plan.cropId);

    // Calculate fresh economics and irrigation data
    const calculation = calculateCropPlan({
      cropId: plan.cropId,
      areaAcre: plan.areaAcre,
      sowingDate: plan.sowingDate,
      soilType: plan.farm.soilType,
      irrigationMethod: plan.irrigationMethod as any,
    });

    const irrigation = calculateIrrigationRequirements(
      plan.cropId,
      plan.areaAcre,
      plan.irrigationMethod as any
    );

    // Actual ledger aggregates
    const actualExpenseTotal = plan.expenses.reduce((sum, e) => sum + e.amount, 0);
    const actualIncomeTotal = plan.incomes.reduce((sum, i) => sum + i.totalAmount, 0);
    const actualNetProfit = actualIncomeTotal - actualExpenseTotal;

    return NextResponse.json({
      plan,
      cropData,
      calculation,
      irrigation,
      ledger: {
        actualExpenseTotal,
        actualIncomeTotal,
        actualNetProfit,
        varianceCost: actualExpenseTotal - calculation.totalCost,
        varianceProfit: actualNetProfit - calculation.netProfit,
      },
    });
  } catch (error) {
    console.error("GET /api/planner/[planId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await req.json();
    const { status, actualYield, actualSoldPrice, actualTotalCost } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (actualYield !== undefined) updateData.actualYield = Number(actualYield);
    if (actualSoldPrice !== undefined) updateData.actualSoldPrice = Number(actualSoldPrice);
    if (actualTotalCost !== undefined) updateData.actualTotalCost = Number(actualTotalCost);

    if (actualYield && actualSoldPrice && actualTotalCost) {
      updateData.actualNetProfit = (Number(actualYield) * Number(actualSoldPrice)) - Number(actualTotalCost);
    }

    const updatedPlan = await prisma.cropPlan.update({
      where: { id: planId },
      data: updateData,
    });

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("PATCH /api/planner/[planId] error:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    await prisma.cropPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/planner/[planId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
