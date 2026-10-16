import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: user.id },
      include: {
        farms: {
          include: {
            waterSources: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Calculate Progressive Completeness Meter
    let score = 20; // Base account created
    if (profile.fullName && profile.district && profile.village) score += 15;
    if (profile.farms.length > 0) score += 25;
    if (profile.farms.some((f) => f.soilPh !== null || f.soilEc !== null)) score += 20;
    if (profile.farms.some((f) => f.waterSources.length > 0)) score += 20;

    return NextResponse.json({
      profile,
      completenessScore: Math.min(score, 100),
    });
  } catch (error) {
    console.error("Fetch farm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      surveyNumber,
      ulpin,
      ownershipType,
      areaAcre,
      soilType,
      soilPh,
      soilEc,
      soilOrganicCarbon,
      terrain,
      waterSources,
    } = body;

    if (!name || !areaAcre || areaAcre <= 0) {
      return NextResponse.json(
        { error: "Plot name and valid land area are required" },
        { status: 400 }
      );
    }

    // Validate ULPIN format if provided (standard 14 alphanumeric characters)
    if (ulpin && !/^[A-Za-z0-9]{14}$/.test(String(ulpin).trim())) {
      return NextResponse.json(
        { error: "ULPIN must be exactly 14 alphanumeric characters (e.g., MH261412345678)" },
        { status: 400 }
      );
    }

    const farm = await prisma.farm.create({
      data: {
        farmerId: profile.id,
        name: String(name).trim(),
        surveyNumber: surveyNumber ? String(surveyNumber).trim() : null,
        ulpin: ulpin ? String(ulpin).trim().toUpperCase() : null,
        ownershipType: ownershipType || "owned",
        areaAcre: parseFloat(areaAcre),
        soilType: soilType || "Medium_Black",
        soilPh: soilPh ? parseFloat(soilPh) : null,
        soilEc: soilEc ? parseFloat(soilEc) : null,
        soilOrganicCarbon: soilOrganicCarbon ? parseFloat(soilOrganicCarbon) : null,
        terrain: terrain || "Flat",
        waterSources: {
          create: Array.isArray(waterSources)
            ? waterSources.map((ws: any) => ({
                sourceType: ws.sourceType || "Open_Well",
                seasonality: ws.seasonality || "Perennial",
                hasDrip: Boolean(ws.hasDrip),
                hasSprinkler: Boolean(ws.hasSprinkler),
                electricityHoursDaily: ws.electricityHoursDaily
                  ? parseFloat(ws.electricityHoursDaily)
                  : 8.0,
                pumpHorsepower: ws.pumpHorsepower ? parseFloat(ws.pumpHorsepower) : 5.0,
              }))
            : [],
        },
      },
      include: {
        waterSources: true,
      },
    });

    return NextResponse.json({ success: true, farm });
  } catch (error) {
    console.error("Create farm error:", error);
    return NextResponse.json({ error: "Failed to create farm plot" }, { status: 500 });
  }
}
