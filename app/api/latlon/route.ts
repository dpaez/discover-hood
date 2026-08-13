import { type NextRequest, NextResponse } from 'next/server'

const LOCATIONIQ_API_URL = ({ accessToken, query }: { accessToken: string, query: string }) => `https://api.locationiq.com/v1/autocomplete?key=${accessToken}&q=${query}`

export async function GET(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const { searchParams } = nextUrl;
  const address = searchParams.get("address");
  if (!address || address.length < 4) {
    return Response.json({ error: "Address is required" }, { status: 400 });
  }
  console.log("address", address);
  const response = await fetch(LOCATIONIQ_API_URL({ accessToken: process.env.GEOLOCATIONIQ_ACCESS_TOKEN!, query: address }));
  const data = await response.json();
  return NextResponse.json(data);
}