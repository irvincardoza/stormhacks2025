"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

export const description = "Productivity breakdown by category"

const chartData = [
  { category: "productive", time: 275, fill: "hsl(var(--chart-1))" },
  { category: "unproductive", time: 200, fill: "hsl(var(--chart-2))" },
  { category: "neutral", time: 187, fill: "hsl(var(--chart-3))" },
  { category: "idle", time: 173, fill: "hsl(var(--chart-4))" },
  { category: "other", time: 90, fill: "hsl(var(--chart-5))" },
]

const chartConfig = {
  time: {
    label: "Time (minutes)",
  },
  productive: {
    label: "Productive",
    color: "hsl(var(--chart-1))",
  },
  unproductive: {
    label: "Unproductive",
    color: "hsl(var(--chart-2))",
  },
  neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-3))",
  },
  idle: {
    label: "Idle",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ChartPieSeparatorNone() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Productivity Breakdown</CardTitle>
        <CardDescription>Today's time distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="time"
              nameKey="category"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Productivity up by 12% today <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing time breakdown for today
        </div>
      </CardFooter>
    </Card>
  )
}
