import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Progress } from "components/ui/progress"
import { Badge } from "components/ui/badge"
import { ChartBarInteractive } from "components/charts/chart-bar-interactive"
import { ChartLineInteractive } from "components/charts/chart-line-interactive"
import { ChartRadarGridCircleFill } from "components/charts/chart-radar-grid-circle-fill"

// Mock data for focus metrics
const focusSessions = [
  { id: "1", start: "09:00", end: "11:15", durationSec: 8100, app: "VS Code", window: "project/src/", productivity: "productive" },
  { id: "2", start: "13:00", end: "14:30", durationSec: 5400, app: "Figma", window: "Design System", productivity: "productive" },
  { id: "3", start: "15:00", end: "16:45", durationSec: 6300, app: "VS Code", window: "project/tests/", productivity: "productive" },
]

export function FocusPage() {
  const longestFocus = Math.max(...focusSessions.map(s => s.durationSec)) / 60

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Focus" 
        description="Visualize your deep-work streaks and their distribution"
      />
      
      <div className="grid gap-6 px-6">
        {/* Longest Focus */}
        <Card>
          <CardHeader>
            <CardTitle>Longest Focus Session</CardTitle>
            <CardDescription>
              Your deepest work session today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary">{Math.round(longestFocus)}m</div>
                <div className="text-sm text-muted-foreground mt-2">Longest focus session</div>
                <Progress value={75} className="w-32 mt-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus Session Histogram */}
        <ChartBarInteractive />

        {/* Focus by Hour */}
        <ChartLineInteractive />

        {/* Category Strengths */}
        <ChartRadarGridCircleFill />

        {/* Recent Focus Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Focus Sessions</CardTitle>
            <CardDescription>
              Your focus sessions from today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {focusSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <div className="font-medium">{session.app}</div>
                      <div className="text-sm text-muted-foreground">{session.window}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{session.start} - {session.end}</Badge>
                    <div className="text-sm font-medium">
                      {Math.round(session.durationSec / 60)}m
                    </div>
                    <Badge variant="default">productive</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
