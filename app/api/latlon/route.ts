import { type NextRequest, NextResponse } from "next/server";

import { autocomplete, CACHE_CONTROL } from "@/lib/locationiq";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || address.trim().length < 4) {
    return NextResponse.json(
      { error: "Address is required" },
      { status: 400 },
    );
  }

  const data = await autocomplete(address);
  if (!Array.isArray(data)) {
    return NextResponse.json({ error: data.error }, { status: 502 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": CACHE_CONTROL.latlon },
  });
}
