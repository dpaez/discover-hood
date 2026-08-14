'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ScoreProps {
  score: number | null;
  type: "walking" | "driving" | "urban";
}

const colorizeScore = (score: number, type: ScoreProps["type"]) => {
  if (type === "urban") {
    if (score >= 70) return "text-lime-800";
    if (score >= 50) return "text-lime-600";
    if (score >= 30) return "text-yellow-400";
    if (score >= 10) return "text-orange-400";
    return "text-red-700";
  }

  if (score >= 8) return "text-lime-800";
  if (score >= 6) return "text-lime-600";
  if (score >= 4) return "text-yellow-400";
  if (score >= 2) return "text-orange-400";
  return "text-red-700";
};

export default function Score({ score, type }: ScoreProps) {
  if (score === null || score === undefined) {
    return <Skeleton className="size-32" />;
  }

  return (
    <Card size="sm" className="relative mx-auto w-full max-w-sm">
      <div
        className={cn(
          "text-6xl text-center font-semibold font-heading",
          colorizeScore(score, type),
        )}
      >
        {Math.round(score)}
      </div>
      <CardContent>
        <CardTitle className="text-sm font-extralight font-sans text-center capitalize">
          {type} Score
        </CardTitle>
      </CardContent>
    </Card>
  );
}