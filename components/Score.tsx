import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ScoreProps {
  score: number | null;
  type: "walking" | "driving" | "urban";
}

export default function Score({score, type}: ScoreProps) {
  return (
    <Card className="relative mx-auto w-full max-w-sm">
      <Suspense fallback={<Skeleton className="size-48 animate-pulse" />}>
        <div className="text-8xl w-48 text-center font-bold font-heading" >
         { score !== null ? score : '?' }
        </div>
      </Suspense>
      <CardHeader>
        <CardTitle className="text-xl font-light font-sans text-center capitalize">{type} Score</CardTitle>
      </CardHeader>
    </Card>
  )
}