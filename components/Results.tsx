"use client"

import { useState } from "react";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import Score from "./Score";
import Map from "./Map";

export default function Results({latLon}: {latLon: {lat: string, lon: string} | null}) {
  const [walkingScore, setWalkingScore] = useState(null);
  const [drivingScore, setDrivingScore] = useState(null);
  const [urbanIndex, setUrbanIndex] = useState(null);

  return (
    <Suspense fallback={<Skeleton className="size-48 animate-pulse" />}>
      <div className="flex flex-row gap-4 items-start justify-center">
        <div className="flex flex-col gap-4">
          <Score type="walking" score={walkingScore} />
          <Score type="driving" score={drivingScore} />
          <Score type="urban" score={urbanIndex} />
        </div>    
          
            
        <div className="w-full flex-1 items-start flex bg-gray-100">
        {latLon?.lat && latLon?.lon && (
          <Map key={`${latLon.lat}-${latLon.lon}`} lat={latLon.lat} lon={latLon.lon} />
        )}
        </div>
      </div>
    </Suspense>
  )
}