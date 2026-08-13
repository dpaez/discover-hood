"use client"

import { useState } from "react";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import Score from "./Score";
import { convertServerPatchToFullTree } from "next/dist/client/components/segment-cache/navigation";

export default function Results({latLon}: {latLon: {lat: string, lon: string} | null}) {
  const [walkingScore, setWalkingScore] = useState(null);
  const [drivingScore, setDrivingScore] = useState(null);
  const [urbanIndex, setUrbanIndex] = useState(null);
console.log(latLon);
  return (
    <Suspense fallback={<Skeleton className="size-48 animate-pulse" />}>
      <div className="flex flex-row gap-4 items-center justify-center">
        <div className="flex flex-col gap-4">
          <Score type="walking" score={walkingScore} />
          <Score type="driving" score={drivingScore} />
          <Score type="urban" score={urbanIndex} />
        </div>    
          
            
        <div className="w-full flex-1 flex bg-gray-100">
          MAP
        </div>
      </div>
    </Suspense>
  )
}