"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"

export const description = "App usage and productivity tracking"

const chartData = [
  { time: "09:00", productive: 45, unproductive: 15 },
  { time: "10:00", productive: 60, unproductive: 20 },
  { time: "11:00", productive: 30, unproductive: 30 },
  { time: "12:00", productive: 15, unproductive: 45 },
  { time: "13:00", productive: 20, unproductive: 40 },
  { time: "14:00", productive: 55, unproductive: 25 },
  { time: "15:00", productive: 40, unproductive: 20 },
  { time: "16:00", productive: 35, unproductive: 25 },
  { time: "17:00", productive: 25, unproductive: 35 },
]

const chartConfig = {
  minutes: {
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
} satisfies ChartConfig

export function ChartBarInteractive() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("productive")

  const total = React.useMemo(
    () => ({
      productive: chartData.reduce((acc, curr) => acc + curr.productive, 0),
      unproductive: chartData.reduce((acc, curr) => acc + curr.unproductive, 0),
    }),
    []
  )

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Productivity Over Time</CardTitle>
          <CardDescription>
            Track your productive vs unproductive time throughout the day
          </CardDescription>
        </div>
        <div className="flex">
          {["productive", "unproductive"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}m
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="minutes"
                  labelFormatter={(value) => {
                    return `Time: ${value}`
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
