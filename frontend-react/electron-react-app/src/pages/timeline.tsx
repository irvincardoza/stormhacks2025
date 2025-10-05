import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { ChartBarStacked } from "components/ui/chart-bar-stacked"
import { MoreHorizontal, RefreshCw } from "components/icons/lucide-adapter"
import { useTimelineData, useDashboardActions } from "providers/dashboard-data-provider"

// Localized time formatter: e.g., 9:15 AM (no seconds)
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

function formatEventTime(tsOrObj: string | { ts?: string; timestamp?: string }) {
  const raw = typeof tsOrObj === "string" ? tsOrObj : (tsOrObj.timestamp ?? tsOrObj.ts ?? "")
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return timeFormatter.format(date)
}

export function TimelinePage() {
  const { dailyTimeline, activityEvents } = useTimelineData()
  const { refresh, isRefreshing } = useDashboardActions()
  const eventCount = activityEvents.length

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Timeline" 
        description="See your day as stacked blocks of app usage"
      />
      
      <div className="space-y-8 px-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Daily Timeline</h3>
          <ChartBarStacked 
            data={dailyTimeline.points}
            config={dailyTimeline.config}
            title="Daily Timeline"
            description="Your app usage breakdown by hour"
            showFooter={true}
          />
        </div>

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
                  <Badge variant="secondary">{eventCount} events</Badge>
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
                    <TableHead>Category</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Idle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityEvents.map((event: any, index: number) => {
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
                        <Badge variant="outline">{event.category}</Badge>
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
                        {event.idleSec > 0 ? `${Math.round(event.idleSec / 60)}m` : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Relabel
                        </Button>
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
