import { Suspense } from "react";

import Home from "@/components/Home";
import { pickPopularAddresses } from "@/lib/popular-addresses";
import { reverseGeocode } from "@/lib/reverse";

async function HomeWithLocation({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lon?: string }>;
}) {
  const { lat: initialLat, lon: initialLon } = await searchParams;

  const hasCoords =
    initialLat &&
    initialLon &&
    Number.isFinite(Number(initialLat)) &&
    Number.isFinite(Number(initialLon));

  const initialAddress = hasCoords
    ? await reverseGeocode(initialLat, initialLon)
    : null;

  const popularAddresses = pickPopularAddresses(5);

  return (
    <Home
      key={`home-${initialLat}-${initialLon}`}
      initialLat={initialLat}
      initialLon={initialLon}
      initialAddress={initialAddress?.display_name}
      popularAddresses={popularAddresses}
    />
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lon?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 lg:p-8">
      <h1 className="text-4xl font-bold">Address Insights</h1>
      <p className="text-sm text-muted-foreground">
        Find hidden gems in your neighborhood 💎
      </p>
      <Suspense fallback={<div className="p-8 text-muted-foreground">Loading…</div>}>
        <HomeWithLocation searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
