import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { ChartBarStacked } from "components/ui/chart-bar-stacked"
import { MoreHorizontal, RefreshCw } from "components/icons/lucide-adapter"
import { useTimelineData } from "providers/dashboard-data-provider"

export function TimelinePage() {
  const { dailyTimeline, activityEvents } = useTimelineData()
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
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
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
                  {activityEvents.map((event, index) => (
                    <TableRow key={`${event.ts}-${index}`}>
                      <TableCell className="font-mono text-sm">
                        {new Date(event.ts).toLocaleTimeString()}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
