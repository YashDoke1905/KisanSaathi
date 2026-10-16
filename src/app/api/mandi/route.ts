import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMandiIntelligence } from "@/services/mandi/adapter";
import { calculateSellOrWaitDecision } from "@/engine/market";

// GET /api/mandi?cropId=onion&district=Nashik&quantity=50&holdingDays=15
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cropId = searchParams.get("cropId") || "onion";
    let district = searchParams.get("district");
    const quantity = Number(searchParams.get("quantity")) || 50;
    const holdingDays = Number(searchParams.get("holdingDays")) || 30;

    // If district not specified in query, attempt to read from logged-in farmer profile
    if (!district) {
      try {
        const user = await getCurrentUser();
        if (user?.profile?.district) {
          district = user.profile.district;
        }
      } catch {}
    }
    district = district || "Nashik";

    // 1. Fetch Mandi intelligence, trends, and competitor APMCs
    const mandiData = await getMandiIntelligence(cropId, district);

    // 2. Compute Sell-or-Wait decision
    const currentPrice = mandiData.nearestMandi?.modalPrice || mandiData.stateAverageModalPrice;
    const distanceKm = mandiData.nearestMandi?.distanceKm || 25;

    const sellOrWait = calculateSellOrWaitDecision({
      cropId,
      quantityQuintals: quantity,
      currentModalPrice: currentPrice,
      mandiDistanceKm: distanceKm,
      holdingDays,
      mandiFeePercent: mandiData.nearestMandi?.marketFeePercent || 1.05,
      hamaliPerQtl: mandiData.nearestMandi?.hamaliPerQuintal || 16,
    });

    return NextResponse.json({
      success: true,
      mandi: mandiData,
      sellOrWait,
    });
  } catch (error) {
    console.error("GET /api/mandi error:", error);
    return NextResponse.json(
      { error: "Failed to load mandi market intelligence" },
      { status: 500 }
    );
  }
}
