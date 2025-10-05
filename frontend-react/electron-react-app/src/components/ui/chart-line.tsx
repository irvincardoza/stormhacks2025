"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"

export const description = "A line chart with customizable colors"

const data = [
  { month: "January", desktop: 186, laptop: 80, tablet: 64 },
  { month: "February", desktop: 305, laptop: 200, tablet: 100 },
  { month: "March", desktop: 237, laptop: 120, tablet: 80 },
  { month: "April", desktop: 73, laptop: 40, tablet: 20 },
  { month: "May", desktop: 209, laptop: 100, tablet: 60 },
  { month: "June", desktop: 214, laptop: 140, tablet: 40 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  laptop: {
    label: "Laptop",
    color: "hsl(var(--chart-2))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartLine({ data: chartData, config }: { data: any[], config: ChartConfig }) {
  return (
    <ChartContainer config={config} className="mx-auto h-[400px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        {Object.entries(config).map(([key, item]) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={item.color}
            strokeWidth={2}
            dot={{
              fill: item.color,
            }}
            activeDot={{
              r: 6,
            }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}
