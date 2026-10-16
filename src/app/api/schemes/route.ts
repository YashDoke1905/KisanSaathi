import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateAllSchemes,
  calculateKccCreditLimit,
  FarmerSchemeProfile,
  STANDARD_DOCUMENTS,
} from "@/engine/schemes";
import { VERIFIED_SCHEMES } from "@/data/schemes";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryFilter = searchParams.get("category");
    const statusFilter = searchParams.get("status");
    const authorityFilter = searchParams.get("authority");

    let user = await getCurrentUser();
    if (!user) {
      user = (await prisma.user.findUnique({
        where: { username: "demo" },
        include: {
          profile: {
            include: {
              farms: {
                include: {
                  waterSources: true,
                  cropPlans: {
                    include: { crop: true },
                  },
                },
              },
              documents: true,
            },
          },
        },
      })) as any;
    }

    const profileData = user?.profile;
    const farms = profileData?.farms || [];

    // Calculate aggregated land & resources
    const totalLandAcres =
      farms.length > 0
        ? farms.reduce((sum: number, f: any) => sum + (f.areaAcre || 0), 0)
        : 3.5; // fallback 3.5 acres

    const isLandOwner =
      farms.length > 0
        ? farms.some((f: any) => f.ownershipType === "owned")
        : true;

    // Collect distinct water sources
    const waterSourcesSet = new Set<string>();
    let hasElectricity = false;
    farms.forEach((f: any) => {
      f.waterSources?.forEach((ws: any) => {
        if (ws.sourceType) waterSourcesSet.add(ws.sourceType);
        if (ws.electricityHoursDaily && ws.electricityHoursDaily > 0) {
          hasElectricity = true;
        }
      });
    });
    if (waterSourcesSet.size === 0) {
      waterSourcesSet.add("Open_Well");
      waterSourcesSet.add("Borewell");
      hasElectricity = true;
    }

    // Collect crops grown from cropPlans or defaults
    const cropsSet = new Set<string>();
    const cropsForKcc: { cropId: string; areaAcre: number }[] = [];
    farms.forEach((f: any) => {
      f.cropPlans?.forEach((cp: any) => {
        if (cp.cropId) {
          cropsSet.add(cp.cropId.toLowerCase());
          cropsForKcc.push({ cropId: cp.cropId.toLowerCase(), areaAcre: cp.areaAcre || 1.0 });
        }
      });
    });
    if (cropsSet.size === 0) {
      // Default sample crops for Maharashtra farmer
      cropsSet.add("cotton");
      cropsSet.add("soybean");
      cropsSet.add("onion");
      cropsForKcc.push({ cropId: "cotton", areaAcre: 1.5 });
      cropsForKcc.push({ cropId: "soybean", areaAcre: 1.0 });
      cropsForKcc.push({ cropId: "onion", areaAcre: 1.0 });
    }

    // Default held documents for demo/standard farmer (7/12, Aadhaar, Bank Passbook)
    const heldDocumentKeys = [
      "doc_7_12",
      "doc_8a",
      "doc_aadhaar_npci",
      "doc_bank_passbook",
      "doc_e_pik_pahani",
    ];

    const farmerSchemeProfile: FarmerSchemeProfile = {
      totalLandAcres,
      socialCategory: (profileData?.category as any) || "General",
      isLandOwner,
      gender: "Male",
      cropsGrown: Array.from(cropsSet),
      waterSources: Array.from(waterSourcesSet),
      hasElectricityConnection: hasElectricity,
      district: profileData?.district || "Nashik",
      heldDocumentKeys,
    };

    // Run evaluation engine
    const { evaluatedSchemes, summary } = evaluateAllSchemes(
      farmerSchemeProfile,
      VERIFIED_SCHEMES
    );

    // Apply query filters if present
    let filteredSchemes = evaluatedSchemes;
    if (categoryFilter && categoryFilter !== "all") {
      filteredSchemes = filteredSchemes.filter(
        (es) => es.scheme.category === categoryFilter
      );
    }
    if (authorityFilter && authorityFilter !== "all") {
      filteredSchemes = filteredSchemes.filter(
        (es) => es.scheme.authority.toLowerCase() === authorityFilter.toLowerCase()
      );
    }
    if (statusFilter && statusFilter !== "all") {
      filteredSchemes = filteredSchemes.filter((es) => es.status === statusFilter);
    }

    // Calculate KCC credit limit
    const kccResult = calculateKccCreditLimit(cropsForKcc, totalLandAcres);

    // Format standard documents with possession status
    const documentsStatus = STANDARD_DOCUMENTS.map((doc) => ({
      ...doc,
      isHeld: heldDocumentKeys.includes(doc.key),
    }));

    return NextResponse.json({
      success: true,
      farmerProfile: farmerSchemeProfile,
      summary,
      kccResult,
      documentsStatus,
      totalCount: filteredSchemes.length,
      schemes: filteredSchemes,
    });
  } catch (error: any) {
    console.error("GET /api/schemes error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate government schemes", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const customProfile: FarmerSchemeProfile = {
      totalLandAcres: typeof body.totalLandAcres === "number" ? body.totalLandAcres : 3.0,
      socialCategory: body.socialCategory || "General",
      isLandOwner: body.isLandOwner !== undefined ? Boolean(body.isLandOwner) : true,
      gender: body.gender || "Male",
      cropsGrown: Array.isArray(body.cropsGrown) ? body.cropsGrown : ["cotton", "soybean"],
      waterSources: Array.isArray(body.waterSources) ? body.waterSources : ["Open_Well"],
      hasElectricityConnection:
        body.hasElectricityConnection !== undefined
          ? Boolean(body.hasElectricityConnection)
          : true,
      district: body.district || "Maharashtra",
      heldDocumentKeys: Array.isArray(body.heldDocumentKeys)
        ? body.heldDocumentKeys
        : ["doc_7_12", "doc_aadhaar_npci", "doc_bank_passbook"],
    };

    const { evaluatedSchemes, summary } = evaluateAllSchemes(
      customProfile,
      VERIFIED_SCHEMES
    );

    // Custom crops for KCC
    const cropsGrownList = customProfile.cropsGrown || ["cotton", "soybean"];
    const cropsForKcc = cropsGrownList.map((c) => ({
      cropId: c,
      areaAcre: customProfile.totalLandAcres / Math.max(1, cropsGrownList.length),
    }));
    const kccResult = calculateKccCreditLimit(cropsForKcc, customProfile.totalLandAcres);

    const documentsStatus = STANDARD_DOCUMENTS.map((doc) => ({
      ...doc,
      isHeld: customProfile.heldDocumentKeys?.includes(doc.key) ?? false,
    }));

    return NextResponse.json({
      success: true,
      farmerProfile: customProfile,
      summary,
      kccResult,
      documentsStatus,
      schemes: evaluatedSchemes,
    });
  } catch (error: any) {
    console.error("POST /api/schemes evaluate error:", error);
    return NextResponse.json(
      { error: "Simulation failed", details: error?.message },
      { status: 500 }
    );
  }
}
