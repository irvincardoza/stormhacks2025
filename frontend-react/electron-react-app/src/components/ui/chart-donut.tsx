"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"

export const description = "A donut chart with customizable colors"

const data = [
  { desktop: 1048, mobile: 240, tablet: 200 },
  { desktop: 944, mobile: 280, tablet: 180 },
  { desktop: 877, mobile: 320, tablet: 160 },
  { desktop: 809, mobile: 360, tablet: 140 },
  { desktop: 741, mobile: 400, tablet: 120 },
  { desktop: 673, mobile: 440, tablet: 100 },
  { desktop: 605, mobile: 480, tablet: 80 },
  { desktop: 537, mobile: 520, tablet: 60 },
  { desktop: 469, mobile: 560, tablet: 40 },
  { desktop: 401, mobile: 600, tablet: 20 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartDonut({ data: chartData, config }: { data: any[], config: ChartConfig }) {
  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="label"
              labelKey="value"
              className="text-sm"
              indicator="dashed"
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || `hsl(var(--chart-${(index % 5) + 1}))`}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
