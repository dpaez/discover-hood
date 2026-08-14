"use client"

import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";


import type { PopularAddress } from "@/lib/popular-addresses";

import Score from "./Score";
import Map from "./Map";
import History from "./History";
import PopularAddresses from "./PopularAddresses";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Results({
  latLon,
  popularAddresses,
}: {
  latLon: { lat: string; lon: string } | null;
  popularAddresses: PopularAddress[];
}) {
  // only call if lat and lon are defined
  const { data, error, isLoading } = useSWR(latLon?.lat ? `/api/scores?lat=${latLon?.lat}&lon=${latLon?.lon}` : null, fetcher);
 
  return (
    <Suspense fallback={<Skeleton className="size-48 animate-pulse" />}>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="order-2 lg:order-1 flex flex-col items-center gap-4">
          <Score type="walking" score={data?.walkingScore} />
          <Score type="driving" score={data?.drivingScore} />
          <Score type="urban" score={data?.urbanIndex} />
        </div>    

        <div className="touch-none order-1 lg:order-2 col-span-1 lg:col-span-4 flex items-start justify-center">
          {latLon?.lat && latLon?.lon && (
            <Map key={`${latLon.lat}-${latLon.lon}`} lat={latLon.lat} lon={latLon.lon} walkingAmenities={data?.walkingAmenities} drivingAmenities={data?.drivingAmenities} />
          )}
          {!latLon?.lat && !latLon?.lon && (
            <div className="w-150 h-100 bg-gray-100 rounded-lg"/>
          )}
        </div>     

        <div className="order-3 lg:order-3 flex flex-col gap-6">
          <History />
          <PopularAddresses addresses={popularAddresses} />
        </div>
      </div>
    </Suspense>
  )
}