'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ScoreProps {
  score: number | null;
  type: "walking" | "driving" | "urban";
}

export default function Score({score, type}: ScoreProps) {
  return (
    <>
    {score ===null || score===undefined && (
      <Skeleton className="size-32" />
    )}
    {score !== null && score !== undefined && (
      <Card size="sm"  className="relative mx-auto w-full max-w-sm">
        <div className="text-6xl text-center font-semibold font-heading text-lime-500" >
          { score.toFixed(1) }
        </div>
        <CardContent>
          <CardTitle className="text-sm font-extralight font-sans text-center capitalize">{type} Score</CardTitle>
        </CardContent>
      </Card>
    )}
    </>
    )
}