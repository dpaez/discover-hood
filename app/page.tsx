"use client";

import { useState } from "react";
import { use } from 'react'

import Address from "@/components/Address";
import Results from "@/components/Results";

export default function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { lat: initialLat, lon: initialLon } = use(searchParams);
  console.log({initialLat, initialLon});
  const [latLon, setLatLon] = useState<{lat: string, lon: string} | null>(null);
  
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center w-full">
          <h1 className="text-5xl mb-4 font-semibold font-heading leading-10 tracking-tight text-black dark:text-zinc-50">
            Address Insights
          </h1>
          <Address setLatLon={setLatLon} initialLat={initialLat || undefined} initialLon={initialLon || undefined} />
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Discover your neighborhood&apos;s hidden gems
          </p>
        </div> 
        <Results latLon={latLon} />
      </main>
    </div>
  );
}
