"use client"

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
import { VSCode, ChromeIcon, FigmaIcon, SlackIcon, TerminalIcon, SystemIcon } from "components/icons/lucide-adapter"

export const description = "A stacked bar chart with a legend"

// App icon mapping
const appIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "VS Code": VSCode,
  "Chrome": ChromeIcon,
  "Figma": FigmaIcon,
  "Slack": SlackIcon,
  "Terminal": TerminalIcon,
  "System": SystemIcon,
}

// Custom legend component with app icons
function AppLegendContent({ config }: { config: ChartConfig }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {Object.entries(config).map(([key, item]) => {
        const IconComponent = appIcons[key] || SystemIcon
        return (
          <div key={key} className="flex items-center gap-2">
            <div style={{ color: item.color }}>
              <IconComponent className="h-4 w-4" />
            </div>
            <span className="text-sm">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

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
            <ChartLegend content={<AppLegendContent config={config} />} />
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
          <div className="text-muted-foreground leading-none font-bold">
            Total app usage for the last 24 hours
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
