import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { ChartBar } from "components/ui/chart-bar"
import { ChartDonut } from "components/ui/chart-donut"
import { MoreHorizontal, ExternalLink } from "components/icons/lucide-adapter"

// Mock data for apps and domains

const appSessions = [
  {
    app: "VS Code",
    domain: null,
    totalTime: 240,
    sessions: 8,
    avgSession: 30,
    productivity: 75
  },
  {
    app: "Chrome",
    domain: "github.com",
    totalTime: 90,
    sessions: 12,
    avgSession: 7.5,
    productivity: 67
  },
  {
    app: "Chrome",
    domain: "stackoverflow.com",
    totalTime: 60,
    sessions: 8,
    avgSession: 7.5,
    productivity: 83
  },
  {
    app: "Figma",
    domain: "figma.com",
    totalTime: 120,
    sessions: 3,
    avgSession: 40,
    productivity: 75
  },
  {
    app: "Slack",
    domain: "slack.com",
    totalTime: 90,
    sessions: 15,
    avgSession: 6,
    productivity: 33
  },
]

export function AppsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Apps & Domains" 
        description="Which apps and sites dominate your time and how productive they are"
      />
      
      <div className="grid gap-6 px-6">
        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">App Usage & Productivity</h3>
            <ChartBar 
              data={[
                { name: "VS Code", time: 186, productivity: 85 },
                { name: "Chrome", time: 142, productivity: 45 },
                { name: "Figma", time: 98, productivity: 92 },
                { name: "Slack", time: 67, productivity: 30 },
                { name: "Terminal", time: 54, productivity: 88 },
              ]}
              config={{
                time: { label: "Time (minutes)", color: "hsl(var(--chart-1))" },
                productivity: { label: "Productivity", color: "hsl(var(--chart-2))" },
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Category Distribution</h3>
            <ChartDonut 
              data={[
                { name: "Development", value: 45, color: "hsl(var(--chart-1))" },
                { name: "Design", value: 25, color: "hsl(var(--chart-2))" },
                { name: "Communication", value: 15, color: "hsl(var(--chart-3))" },
                { name: "Research", value: 10, color: "hsl(var(--chart-4))" },
                { name: "Other", value: 5, color: "hsl(var(--chart-5))" },
              ]}
              config={{
                development: { label: "Development", color: "hsl(var(--chart-1))" },
                design: { label: "Design", color: "hsl(var(--chart-2))" },
                communication: { label: "Communication", color: "hsl(var(--chart-3))" },
                research: { label: "Research", color: "hsl(var(--chart-4))" },
                other: { label: "Other", color: "hsl(var(--chart-5))" },
              }}
            />
          </div>
        </div>

        {/* App Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Productive vs Unproductive Time by App</h3>
          <ChartBar 
            data={[
              { name: "VS Code", productive: 186, unproductive: 45 },
              { name: "Chrome", productive: 67, unproductive: 142 },
              { name: "Figma", productive: 98, unproductive: 12 },
              { name: "Slack", productive: 23, unproductive: 67 },
              { name: "Terminal", productive: 54, unproductive: 8 },
            ]}
            config={{
              productive: { label: "Productive", color: "hsl(var(--chart-1))" },
              unproductive: { label: "Unproductive", color: "hsl(var(--chart-2))" },
            }}
          />
        </div>

        {/* Raw App Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>App Sessions</CardTitle>
            <CardDescription>
              Detailed breakdown of your app usage sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{appSessions.length} sessions</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Total Time</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Avg Session</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appSessions.map((session, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{session.app}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.domain || '-'}
                      </TableCell>
                      <TableCell>{session.totalTime}m</TableCell>
                      <TableCell>{session.sessions}</TableCell>
                      <TableCell>{session.avgSession}m</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${session.productivity}%` }}
                            />
                          </div>
                          <span className="text-sm">{session.productivity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
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
