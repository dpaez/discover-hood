import { type NextRequest, NextResponse } from "next/server";

import { CACHE_CONTROL, reverseGeocode } from "@/lib/locationiq";

function isFiniteNumberParam(value: string | null): value is string {
  if (value === null || value.trim() === "") return false;
  return Number.isFinite(Number(value));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!isFiniteNumberParam(lat) || !isFiniteNumberParam(lon)) {
    return NextResponse.json(
      { error: "Valid lat and lon query parameters are required" },
      { status: 400 },
    );
  }

  const result = await reverseGeocode(lat, lon);
  if (!result) {
    return NextResponse.json(
      { error: "Reverse geocoding failed" },
      { status: 502 },
    );
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": CACHE_CONTROL.reverse },
  });
}
