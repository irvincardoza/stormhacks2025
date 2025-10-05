"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"

export const description = "A bar chart with customizable colors"

export function ChartBar({ data: chartData, config, containerClassName }: { data: any[], config: ChartConfig, containerClassName?: string }) {
  return (
    <ChartContainer config={config} className={containerClassName || "mx-auto h-[400px] w-full"}>
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
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
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
          <Bar
            key={key}
            dataKey={key}
            fill={item.color}
            radius={4}
            stackId="a"
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
