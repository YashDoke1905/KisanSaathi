import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rateLimit";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/Phone and password are required" },
        { status: 400 }
      );
    }

    const cleanId = String(identifier).trim();

    // Rate limit: max 5 login attempts per 10 minutes per identifier
    const rateCheck = await checkRateLimit({
      key: `login:${cleanId}`,
      limit: 5,
      windowSeconds: 600,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    // Lookup by username or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanId }, { phone: cleanId }],
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username/phone or password" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid username/phone or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
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
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
