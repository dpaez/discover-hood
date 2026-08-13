"use client"

import { useState } from "react";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import Score from "./Score";
import Map from "./Map";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Results({latLon}: {latLon: {lat: string, lon: string} | null}) {
  // only call if lat and lon are defined
  const { data, error, isLoading } = useSWR(latLon ? `/api/scores?lat=${latLon?.lat}&lon=${latLon?.lon}` : null, fetcher);

  return (
    <Suspense fallback={<Skeleton className="size-48 animate-pulse" />}>
      <div className="flex flex-row gap-4 items-start justify-center">
        <div className="flex flex-col gap-4">
          <Score type="walking" score={data?.walkingScore} />
          <Score type="driving" score={data?.drivingScore} />
          <Score type="urban" score={data?.urbanIndex} />
        </div>    
        
            
        <div className="items-start justify-center flex">
        {latLon?.lat && latLon?.lon && (
          <Map key={`${latLon.lat}-${latLon.lon}`} lat={latLon.lat} lon={latLon.lon} />
        )}
        {!latLon?.lat && !latLon?.lon && (
          <div className="w-150 h-100 bg-gray-100 rounded-lg"/>
        )}
        </div>
      </div>
    </Suspense>
  )
}