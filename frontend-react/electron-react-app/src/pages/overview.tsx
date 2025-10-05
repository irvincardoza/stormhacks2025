import { PageHeader } from "../components/dashboard/page-header"
import { ChartPieLegend } from "../components/ui/chart-pie-legend"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"
import { ChartLine } from "../components/ui/chart-line"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { MoreHorizontal, RefreshCw } from "../components/icons/lucide-adapter"
import { useMemo, useState } from "react"
import { useOverviewData, useTimelineData, useDashboardActions } from "../providers/dashboard-data-provider"

export function OverviewPage() {
  const {
    productivityBreakdown,
    hourlyProductivity,
    contextSwitchTrend,
  } = useOverviewData()

  // Pull Activity Feed data from the same source as Timeline
  const { activityEvents } = useTimelineData()
  const { refresh, isRefreshing } = useDashboardActions()

  type RangeKey = "all" | "1m" | "10m" | "1h"
  const [selectedRange, setSelectedRange] = useState<RangeKey>("all")

  // Prefer the source time string from JSON to avoid timezone shifts.
  function formatEventTime(tsOrObj: string | { ts?: string; timestamp?: string }) {
    const raw = typeof tsOrObj === "string" ? tsOrObj : (tsOrObj.timestamp ?? tsOrObj.ts ?? "")
    if (!raw) return ""
    const tIndex = raw.indexOf("T")
    if (tIndex > 0 && raw.length >= tIndex + 8) {
      return raw.slice(tIndex + 1, tIndex + 9)
    }
    return raw
  }

  const filteredSortedEvents = useMemo(() => {
    const nowMs = Date.now()
    let cutoffMs = 0
    if (selectedRange === "1m") cutoffMs = nowMs - 60 * 1000
    else if (selectedRange === "10m") cutoffMs = nowMs - 10 * 60 * 1000
    else if (selectedRange === "1h") cutoffMs = nowMs - 60 * 60 * 1000

    const parseTs = (e: any): number => {
      const raw = e?.ts ?? e?.timestamp ?? ""
      if (!raw || typeof raw !== "string") return 0
      const ms = Date.parse(raw)
      return Number.isNaN(ms) ? 0 : ms
    }

    const withinRange = (ms: number) => cutoffMs === 0 || ms >= cutoffMs

    const list = (activityEvents || [])
      .map((e: any) => ({ e, ms: parseTs(e) }))
      .filter(({ ms }) => withinRange(ms))
      .sort((a, b) => b.ms - a.ms)
      .map(({ e }) => e)

    return list
  }, [activityEvents, selectedRange])

  const eventCount = filteredSortedEvents.length
  const totalCount = activityEvents.length

  const rangeLabel: Record<RangeKey, string> = {
    all: "All",
    "1m": "Last 1m",
    "10m": "Last 10m",
    "1h": "Last 1h",
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Overview" 
        description="High-level health check of your productivity today"
      />
      
      <div className="space-y-8 px-6">
        {/* Full width hourly productivity chart (grouped bars) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hourly Productivity</h3>
          <ChartContainer config={hourlyProductivity.config} className="mx-auto h-[400px] w-full">
            <BarChart
              accessibilityLayer
              data={hourlyProductivity.points}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {/* Keep current theme colors via config with safe fallbacks */}
              <Bar 
                dataKey="productive" 
                fill={hourlyProductivity?.config?.productive?.color ?? 'hsl(var(--chart-1))'} 
                radius={6} 
              />
              <Bar 
                dataKey="unproductive" 
                fill={hourlyProductivity?.config?.unproductive?.color ?? 'hsl(var(--chart-2))'} 
                radius={6} 
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Two column layout for remaining charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <ChartPieLegend 
              data={productivityBreakdown.slices}
              config={productivityBreakdown.config}
              title="Productivity Breakdown"
              description="Today's productivity distribution"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Context Switches Over Time</h3>
            <ChartLine 
              data={contextSwitchTrend.points}
              config={contextSwitchTrend.config}
            />
          </div>
        </div>

        {/* Activity Feed (full-width, responsive) */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              Raw events from your activity tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing' : 'Refresh'}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">{`Filter: ${rangeLabel[selectedRange]}`}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Show events</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={selectedRange} onValueChange={(v) => setSelectedRange(v as RangeKey)}>
                        <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="1m">Last 1m</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="10m">Last 10m</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="1h">Last 1h</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Badge variant="secondary">{eventCount} / {totalCount} events</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>App</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Idle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSortedEvents.map((event: any, index: number) => {
                    const ts = event?.ts ?? event?.timestamp ?? ""
                    return (
                    <TableRow key={`${ts || index}-${index}`}>
                      <TableCell className="font-mono text-sm">
                        {formatEventTime(ts)}
                      </TableCell>
                      <TableCell className="font-medium">{event.app}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {event.window}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={event.productivity === 'productive' ? 'default' : 
                                  event.productivity === 'unproductive' ? 'destructive' : 'secondary'}
                        >
                          {event.productivity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {typeof event.idleSec === 'number' ? event.idleSec : 0}
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
