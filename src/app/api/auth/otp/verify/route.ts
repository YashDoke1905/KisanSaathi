import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rateLimit";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, otpCode } = await req.json();

    if (!phone || !otpCode) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();
    const cleanOtp = String(otpCode).trim();

    // Rate limit: max 5 verification attempts per 10 minutes
    const rateCheck = await checkRateLimit({
      key: `otp_verify:${cleanPhone}`,
      limit: 5,
      windowSeconds: 600,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Find active non-expired OTP session
    const session = await prisma.otpSession.findFirst({
      where: {
        phone: cleanPhone,
        otpCode: cleanOtp,
        isVerified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    // Mark verified
    await prisma.otpSession.update({
      where: { id: session.id },
      data: { isVerified: true },
    });

    // Check if user exists with this phone; if not, create farmer account
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: { profile: true },
    });

    if (!user) {
      const defaultSalt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash("farmer@123", defaultSalt);

      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          username: `farmer_${cleanPhone.slice(-4)}`,
          passwordHash: defaultHash,
          role: "farmer",
          profile: {
            create: {
              fullName: `शेतकरी (Farmer ${cleanPhone.slice(-4)})`,
              preferredLanguage: "mr",
              district: "Maharashtra",
              taluka: "",
              village: "",
              state: "Maharashtra",
            },
          },
        },
        include: { profile: true },
      });
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
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
