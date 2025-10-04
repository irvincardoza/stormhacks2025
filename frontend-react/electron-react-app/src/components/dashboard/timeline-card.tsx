import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "components/ui/chart"
import { timelineData } from "data/dashboard"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Target, Home, Sparkles } from "components/icons/lucide-adapter"

const timelineConfig: ChartConfig = {
  focus: {
    label: "Focus",
    color: "var(--chart-1)",
  },
  meetings: {
    label: "Meetings",
    color: "var(--chart-2)",
  },
  breaks: {
    label: "Breaks",
    color: "var(--chart-3)",
  },
}

export function TimelineCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-card-foreground">Timeline</CardTitle>
          <p className="text-xs text-muted-foreground">
            AI-augmented view of your workday rhythm
          </p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-[10px] uppercase tracking-widest">
          Predictive
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={timelineConfig} className="h-56">
          <BarChart data={timelineData} barCategoryGap={5}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="hour"
              stroke="hsl(var(--muted-foreground))"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted)/0.2)" as unknown as string }}
              content={<ChartTooltipContent className="min-w-[10rem]" />}
            />
            <Bar
              dataKey="focus"
              stackId="a"
              radius={[6, 6, 0, 0]}
              fill="hsl(var(--chart-1))"
            />
            <Bar dataKey="meetings" stackId="a" fill="hsl(var(--chart-2))" />
            <Bar dataKey="breaks" stackId="a" fill="hsl(var(--chart-3))" />
          </BarChart>
        </ChartContainer>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <LegendDot color="hsl(var(--chart-1))" label="Focus sessions" icon={Target} />
          <LegendDot color="hsl(var(--chart-2))" label="Meetings" icon={Home} />
          <LegendDot color="hsl(var(--chart-3))" label="Regenerative breaks" icon={Sparkles} />
        </div>
      </CardContent>
    </Card>
  )
}

type LegendDotProps = {
  color: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

function LegendDot({ color, label, icon: Icon }: LegendDotProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {Icon && <Icon className="size-3" />}
      <span>{label}</span>
    </div>
  )
}
