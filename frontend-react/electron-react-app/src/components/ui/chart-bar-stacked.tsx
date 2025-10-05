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

// Custom legend component with solid color boxes for readability
function AppLegendContent({ config }: { config: ChartConfig }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {Object.entries(config).map(([key, item]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm border"
            style={{ backgroundColor: item.color, borderColor: "hsl(var(--border))" }}
          />
          <span className="text-xs sm:text-sm">{item.label}</span>
        </div>
      ))}
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
    <ChartContainer config={config} className="mx-auto h-[400px] w-full">
      <BarChart 
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
          tickMargin={12}
          interval={0}
          height={40}
          axisLine={false}
        />
        <ChartTooltip 
          content={<ChartTooltipContent 
            hideLabel 
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : Number(value) || 0
              return (
                <>
                  <span className="text-muted-foreground">{String(name)}</span>
                  <span className="text-foreground font-mono font-medium">{num.toFixed(0)}%</span>
                </>
              )
            }}
          />} 
        />
        <ChartLegend content={<AppLegendContent config={config} />} />
        {Object.entries(config).map(([key, item], index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={item.color}
            radius={index === 0 ? [0, 0, 4, 4] : index === Object.keys(config).length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
