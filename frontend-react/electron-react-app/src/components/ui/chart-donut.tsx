"use client"

import * as React from "react"
import { PieChart, Pie, Cell } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"

export const description = "A donut chart with customizable colors"

export function ChartDonut({ data: chartData, config }: { data: any[], config: ChartConfig }) {
  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-[400px] w-full">
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
