"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart"

export const description = "A stacked bar chart with a legend"

export function ChartBarStacked({ 
  data: chartData, 
  config, 
  title = "Daily Timeline",
  description = "Your productivity breakdown by hour",
  showFooter = true 
}: { 
  data: any[], 
  config: ChartConfig,
  title?: string,
  description?: string,
  showFooter?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.entries(config).map(([key, item], index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={item.color}
                radius={index === 0 ? [0, 0, 4, 4] : index === Object.keys(config).length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {showFooter && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total productivity for the last 24 hours
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
