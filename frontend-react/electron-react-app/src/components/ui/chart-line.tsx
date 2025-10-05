"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"
import { filterToTimeWindow } from "lib/chart-time"

export const description = "A line chart with customizable colors"

export function ChartLine({ data: chartData, config, containerClassName }: { data: any[], config: ChartConfig, containerClassName?: string }) {
  const clamped = React.useMemo(() => filterToTimeWindow(chartData), [chartData])
  return (
    <ChartContainer config={config} className={containerClassName || "mx-auto h-[400px] w-full"}>
      <LineChart
        accessibilityLayer
        data={clamped}
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
          tickFormatter={(value) => String(value)}
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
