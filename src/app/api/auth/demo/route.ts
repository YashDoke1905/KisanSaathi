import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    // Find the seeded demo user
    let user = await prisma.user.findUnique({
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
    });

    if (!user) {
      return NextResponse.json(
        { error: "Demo user not seeded. Please run npm run prisma:seed" },
        { status: 500 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
      username: user.username,
    });

    await setSessionCookie(token);

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Failed to initiate demo session" },
      { status: 500 }
    );
  }
}
