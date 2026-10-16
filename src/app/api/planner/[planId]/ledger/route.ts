import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await req.json();
    const { type, amount, category, date, notes, quantityQuintal, ratePerQuintal, mandiName } = body;

    const plan = await prisma.cropPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Crop plan not found" }, { status: 404 });
    }

    if (type === "expense") {
      const expense = await prisma.expense.create({
        data: {
          planId,
          farmId: plan.farmId,
          expenseDate: date ? new Date(date) : new Date(),
          category: category || "Other",
          amount: Number(amount),
          notes: notes || null,
        },
      });
      return NextResponse.json({ success: true, expense });
    } else if (type === "income") {
      const q = Number(quantityQuintal || 0);
      const r = Number(ratePerQuintal || 0);
      const total = Number(amount || q * r);

      const income = await prisma.income.create({
        data: {
          planId,
          farmId: plan.farmId,
          saleDate: date ? new Date(date) : new Date(),
          quantityQuintal: q,
          ratePerQuintal: r,
          totalAmount: total,
          mandiName: mandiName || null,
        },
      });
      return NextResponse.json({ success: true, income });
    }

    return NextResponse.json({ error: "Invalid ledger entry type" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/planner/[planId]/ledger error:", error);
    return NextResponse.json({ error: "Failed to save ledger entry" }, { status: 500 });
  }
}
