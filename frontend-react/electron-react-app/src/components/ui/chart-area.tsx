"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"

export const description = "An area chart with customizable colors"

export function ChartArea({ data: chartData, config }: { data: any[], config: ChartConfig }) {
  return (
    <ChartContainer config={config} className="mx-auto h-[400px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
          bottom: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tickFormatter={(value) => value}
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
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            stackId="1"
            stroke={item.color}
            fill={item.color}
            fillOpacity={0.4}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}
