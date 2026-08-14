// components/Home.tsx — "use client"
"use client";

import { useState } from "react";
import { SWRConfig } from 'swr'

import Address from "@/components/Address";
import Results from "@/components/Results";
import type { PopularAddress } from "@/lib/popular-addresses";

export default function Home({
  initialLat,
  initialLon,
  initialAddress,
  popularAddresses,
}: {
  initialLat?: string;
  initialLon?: string;
  initialAddress?: string;
  popularAddresses: PopularAddress[];
}) {
  const [latLon, setLatLon] = useState(
    initialLat && initialLon
      ? { lat: initialLat, lon: initialLon }
      : null
  );

  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        revalidateOnFocus: false,
        dedupingInterval: 60_000,
      }}
    >
      <main className="flex flex-1 gap-4 lg:gap-8 w-full max-w-7xl flex-col items-center justify-between  lg:p-16 p-4 bg-white dark:bg-black ">
        <Address
          setLatLon={setLatLon}
          initialLat={initialLat}
          initialLon={initialLon}
          initialAddress={initialAddress}
        />
        <Results latLon={latLon} popularAddresses={popularAddresses} />
      </main>
    </SWRConfig>
  );
}