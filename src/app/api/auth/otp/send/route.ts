import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawInput = body.identifier || body.phone;
    const isForgotPassword = Boolean(body.isForgotPassword);

    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json(
        { error: "Please enter your mobile number or username" },
        { status: 400 }
      );
    }

    const trimmed = rawInput.trim();
    let targetPhone = "";
    let matchedUser = null;

    // Check if input is digits-only (phone number with optional +91, 0, or spaces)
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length >= 10) {
      targetPhone = digitsOnly.slice(-10); // Extract 10-digit mobile number
      matchedUser = await prisma.user.findFirst({
        where: { phone: targetPhone },
        include: { profile: true },
      });
    } else {
      // Input is a username (e.g. "demo" or "tukaram")
      matchedUser = await prisma.user.findFirst({
        where: { username: trimmed },
        include: { profile: true },
      });
      if (matchedUser && matchedUser.phone) {
        targetPhone = matchedUser.phone;
      }
    }

    // For Forgot Password, ensure user account actually exists
    if (isForgotPassword && !matchedUser) {
      return NextResponse.json(
        { error: `No farmer account found for "${trimmed}". Please check or sign up.` },
        { status: 404 }
      );
    }

    // If still no valid phone, reject
    if (!targetPhone || targetPhone.length !== 10) {
      return NextResponse.json(
        { error: "Could not find a valid 10-digit mobile number. Please enter your mobile number." },
        { status: 400 }
      );
    }

    // Rate limit check: in dev mode, allow up to 100 requests so testing is never blocked
    const isDevMode = process.env.OTP_DEV_MODE === "true" || process.env.NODE_ENV !== "production";
    const limit = isDevMode ? 100 : 3;

    const rateCheck = await checkRateLimit({
      key: `otp_send:${targetPhone}`,
      limit,
      windowSeconds: 600,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Save in database
    await prisma.otpSession.create({
      data: {
        phone: targetPhone,
        otpCode,
        expiresAt,
      },
    });

    // Send via SMS Adapter (prints in server terminal in Dev Mode)
    const smsResult = await sendOtpSms(targetPhone, otpCode);

    // Mask phone for privacy in UI: e.g. "XXXXXX3210"
    const maskedPhone = `XXXXXX${targetPhone.slice(-4)}`;

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${maskedPhone}`,
      phone: targetPhone,
      maskedPhone,
      debugOtp: smsResult.debugOtp, // returned for dev mode testing
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch verification code" },
      { status: 500 }
    );
  }
}
