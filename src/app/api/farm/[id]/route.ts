import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const farm = await prisma.farm.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!farm || farm.farmer.userId !== user.id) {
      return NextResponse.json(
        { error: "Farm plot not found or access denied" },
        { status: 403 }
      );
    }

    await prisma.farm.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Farm deleted" });
  } catch (error) {
    console.error("Delete farm error:", error);
    return NextResponse.json({ error: "Failed to delete farm" }, { status: 500 });
  }
}
