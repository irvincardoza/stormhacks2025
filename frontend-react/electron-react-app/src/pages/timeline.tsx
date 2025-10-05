import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { ChartBar } from "components/ui/chart-bar"
import { MoreHorizontal, RefreshCw } from "components/icons/lucide-adapter"

const activityEvents = [
  {
    ts: "2024-01-15T09:00:00Z",
    app: "VS Code",
    window: "project/src/App.tsx",
    domain: null,
    idleSec: 0,
    category: "Development",
    productivity: "productive"
  },
  {
    ts: "2024-01-15T09:15:00Z",
    app: "Chrome",
    window: "GitHub - project",
    domain: "github.com",
    idleSec: 0,
    category: "Development",
    productivity: "productive"
  },
  {
    ts: "2024-01-15T09:30:00Z",
    app: "Slack",
    window: "Team Chat",
    domain: "slack.com",
    idleSec: 0,
    category: "Communication",
    productivity: "neutral"
  },
  {
    ts: "2024-01-15T10:00:00Z",
    app: "VS Code",
    window: "project/src/components/",
    domain: null,
    idleSec: 0,
    category: "Development",
    productivity: "productive"
  },
  {
    ts: "2024-01-15T10:30:00Z",
    app: "Chrome",
    window: "Stack Overflow",
    domain: "stackoverflow.com",
    idleSec: 0,
    category: "Development",
    productivity: "productive"
  },
  {
    ts: "2024-01-15T11:00:00Z",
    app: "Twitter",
    window: "Home / X",
    domain: "twitter.com",
    idleSec: 0,
    category: "Social",
    productivity: "unproductive"
  },
  {
    ts: "2024-01-15T11:15:00Z",
    app: "VS Code",
    window: "project/",
    domain: null,
    idleSec: 0,
    category: "Development",
    productivity: "productive"
  },
  {
    ts: "2024-01-15T12:00:00Z",
    app: "System",
    window: "Lunch Break",
    domain: null,
    idleSec: 1800,
    category: "Break",
    productivity: "idle"
  },
]

export function TimelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Timeline" 
        description="See your day as stacked blocks of productivity"
      />
      
      <div className="grid gap-6 px-6">
        {/* Time-of-Day Stacked Bars */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Daily Timeline</h3>
          <ChartBar 
            data={[
              { name: "09:00", focus: 45, meetings: 15, breaks: 0 },
              { name: "10:00", focus: 60, meetings: 0, breaks: 0 },
              { name: "11:00", focus: 30, meetings: 30, breaks: 0 },
              { name: "12:00", focus: 0, meetings: 0, breaks: 60 },
              { name: "13:00", focus: 20, meetings: 40, breaks: 0 },
              { name: "14:00", focus: 55, meetings: 0, breaks: 5 },
              { name: "15:00", focus: 40, meetings: 20, breaks: 0 },
              { name: "16:00", focus: 35, meetings: 25, breaks: 0 },
              { name: "17:00", focus: 25, meetings: 35, breaks: 0 },
            ]}
            config={{
              focus: { label: "Focus", color: "hsl(var(--chart-1))" },
              meetings: { label: "Meetings", color: "hsl(var(--chart-2))" },
              breaks: { label: "Breaks", color: "hsl(var(--chart-3))" },
            }}
          />
        </div>

        {/* Activity Feed */}
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
                  <Badge variant="secondary">8 events</Badge>
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
                    <TableRow key={index}>
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
