import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Progress } from "components/ui/progress"
import { Badge } from "components/ui/badge"
import { ChartBar } from "components/ui/chart-bar"
import { ChartLine } from "components/ui/chart-line"

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
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

          {/* Category Strengths */}
          <div className="lg:col-span-2">
            <ChartLine 
              data={[
                { name: "Development", minutes: 186 },
                { name: "Design", minutes: 285 },
                { name: "Communication", minutes: 237 },
                { name: "Research", minutes: 203 },
                { name: "Meetings", minutes: 209 },
                { name: "Other", minutes: 264 },
              ]}
              config={{
                minutes: { label: "Focus Time (minutes)", color: "hsl(var(--chart-1))" },
              }}
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Focus Session Distribution</h3>
            <ChartBar 
              data={[
                { name: "0-15m", sessions: 2 },
                { name: "15-30m", sessions: 5 },
                { name: "30-45m", sessions: 8 },
                { name: "45-60m", sessions: 12 },
                { name: "60-90m", sessions: 6 },
                { name: "90m+", sessions: 3 },
              ]}
              config={{
                sessions: { label: "Sessions", color: "hsl(var(--chart-1))" },
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Focus Score Over Time</h3>
            <ChartLine 
              data={[
                { name: "09:00", focus: 85 },
                { name: "10:00", focus: 92 },
                { name: "11:00", focus: 78 },
                { name: "12:00", focus: 45 },
                { name: "13:00", focus: 88 },
                { name: "14:00", focus: 95 },
                { name: "15:00", focus: 82 },
                { name: "16:00", focus: 76 },
                { name: "17:00", focus: 68 },
              ]}
              config={{
                focus: { label: "Focus Score", color: "hsl(var(--chart-2))" },
              }}
            />
          </div>
        </div>

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
