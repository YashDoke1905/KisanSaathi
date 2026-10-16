import { NextRequest, NextResponse } from "next/server";
import { fetchAgroWeather } from "@/services/weather/openMeteoAdapter";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district") || "Nashik";
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");

    const lat = latParam ? parseFloat(latParam) : undefined;
    const lon = lonParam ? parseFloat(lonParam) : undefined;

    const data = await fetchAgroWeather(lat, lon, district);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve agro-weather forecast" },
      { status: 500 }
    );
  }
}
