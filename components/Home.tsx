// components/Home.tsx — "use client"
"use client";

import { useState } from "react";
import { SWRConfig } from 'swr'

import Address from "@/components/Address";
import Results from "@/components/Results";

export default function Home({
  initialLat,
  initialLon,
  initialAddress,
}: {
  initialLat?: string;
  initialLon?: string;
  initialAddress?: string;
}) {
  const [latLon, setLatLon] = useState(
    initialLat && initialLon
      ? { lat: initialLat, lon: initialLon }
      : null
  );

  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <main className="flex flex-1 w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black ">
        <Address
          setLatLon={setLatLon}
          initialLat={initialLat}
          initialLon={initialLon}
          initialAddress={initialAddress}
        />
        <Results latLon={latLon} />
      </main>
    </SWRConfig>
  );
}