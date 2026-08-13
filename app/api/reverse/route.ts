import { type NextRequest, NextResponse } from "next/server";

import type { LocationIQReverseResponse } from "@/app/types";

const LOCATIONIQ_REVERSE_URL = ({
  accessToken,
  lat,
  lon,
}: {
  accessToken: string;
  lat: string;
  lon: string;
}) =>
  `https://api.locationiq.com/v1/reverse?key=${accessToken}&lat=${lat}&lon=${lon}&format=json`;

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

  const response = await fetch(
    LOCATIONIQ_REVERSE_URL({
      accessToken: process.env.GEOLOCATIONIQ_ACCESS_TOKEN!,
      lat,
      lon,
    }),
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          typeof data?.error === "string"
            ? data.error
            : "Reverse geocoding failed",
      },
      { status: response.status },
    );
  }

  const result: LocationIQReverseResponse = {
    place_id: data.place_id,
    display_name: data.display_name,
    address: data.address ?? {},
  };

  return NextResponse.json(result);
}
