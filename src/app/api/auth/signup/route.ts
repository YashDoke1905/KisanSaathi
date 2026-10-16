import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

const signupSchema = z.object({
  username: z.string().min(3).max(30),
  phone: z.string().regex(/^[0-9]{10}$/, "10-digit mobile number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2),
  district: z.string().min(2),
  taluka: z.string().optional().default(""),
  village: z.string().optional().default(""),
  preferredLanguage: z.enum(["en", "mr", "hi"]).optional().default("mr"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { username, phone, password, fullName, district, taluka, village, preferredLanguage } =
      result.data;

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { phone }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username or phone number is already registered" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        phone,
        passwordHash,
        role: "farmer",
        profile: {
          create: {
            fullName,
            preferredLanguage,
            district,
            taluka: taluka || district,
            village: village || district,
            state: "Maharashtra",
            category: "General",
            experienceYears: 5,
            riskAppetite: "medium",
            budgetCapacity: 50000.0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const token = await createSessionToken({
      userId: newUser.id,
      role: newUser.role,
      phone: newUser.phone,
      username: newUser.username,
    });

    await setSessionCookie(token);

    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "Internal server error during account creation" },
      { status: 500 }
    );
  }
}
