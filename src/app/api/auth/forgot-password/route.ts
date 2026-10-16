import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, otpCode, newPassword } = await req.json();

    if (!phone || !otpCode || !newPassword) {
      return NextResponse.json(
        { error: "Phone, OTP code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    const cleanOtp = String(otpCode).trim();

    // Verify OTP session
    const session = await prisma.otpSession.findFirst({
      where: {
        phone: cleanPhone,
        otpCode: cleanOtp,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code. Please check or request a new code." },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.otpSession.update({
      where: { id: session.id },
      data: { isVerified: true },
    });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user
    const user = await prisma.user.findFirst({
      where: { phone: cleanPhone },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Auto-login user after successful password reset
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
      message: "Password reset successful! Logging you in...",
      user: safeUser,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
