"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"

export const description = "Focus categories and productivity strengths"

const chartData = [
  { category: "Development", minutes: 186 },
  { category: "Design", minutes: 285 },
  { category: "Communication", minutes: 237 },
  { category: "Research", minutes: 203 },
  { category: "Meetings", minutes: 209 },
  { category: "Other", minutes: 264 },
]

const chartConfig = {
  minutes: {
    label: "Focus Time (minutes)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartRadarGridCircleFill() {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Focus Categories</CardTitle>
        <CardDescription>
          Your productivity distribution across different work categories
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid
              className="fill-(--color-minutes) opacity-20"
              gridType="circle"
            />
            <PolarAngleAxis dataKey="category" />
            <Radar
              dataKey="minutes"
              fill="var(--color-minutes)"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Focus time up by 8% this week <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Today's focus distribution
        </div>
      </CardFooter>
    </Card>
  )
}
