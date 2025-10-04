import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { ChartBarInteractive } from "components/charts/chart-bar-interactive"
import { ChartPieSeparatorNone } from "components/charts/chart-pie-separator-none"
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
        {/* Top Apps Horizontal */}
        <ChartBarInteractive />

        {/* App Breakdown Stacked */}
        <ChartBarInteractive />

        {/* Domains Pie */}
        <ChartPieSeparatorNone />

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
