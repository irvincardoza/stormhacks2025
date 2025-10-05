import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { ChartBar } from "components/ui/chart-bar"
import { ChartLine } from "components/ui/chart-line"
import { useFocusData, useIdleData } from "providers/dashboard-data-provider"
import { isDemo } from "../lib/demo"

export function SessionsPage() {
  const focus = useFocusData()
  const idle = useIdleData()

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sessions" 
        description="Focus sessions and idle/break patterns"
      />

      <div className="space-y-8 px-6">
        {/* Focus trends */}
        {isDemo ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hours by Category</h3>
            {(() => {
              // Convert minutes → hours for demo presentation, rounded to 1 decimal.
              const points = (focus.categoryMinutes.points || []).map((p: any) => ({
                name: p.name,
                hours: Math.round(((Number(p.minutes) || 0) / 60) * 10) / 10,
              }))
              const config = { hours: { label: "Focus Time (hours)", color: "hsl(var(--chart-1))" } }
              return <ChartBar data={points} config={config} containerClassName="mx-auto h-[520px] w-full" />
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Focus Score Trend</h3>
              <ChartLine data={focus.focusScoreTrend.points} config={focus.focusScoreTrend.config} />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Minutes by Category</h3>
              <ChartBar data={focus.categoryMinutes.points} config={focus.categoryMinutes.config} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Session Distribution</h3>
            <ChartBar data={focus.sessionDistribution.points} config={focus.sessionDistribution.config} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Idle Minutes Over Time</h3>
            <ChartLine data={idle.idleOverTime.points} config={idle.idleOverTime.config} />
          </div>
        </div>

        {/* Recent focus sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Focus Sessions</CardTitle>
            <CardDescription>
              Detailed breakdown of your latest focus periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Productivity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {focus.sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{new Date(s.start).toLocaleTimeString()}</TableCell>
                    <TableCell className="font-mono text-sm">{new Date(s.end).toLocaleTimeString()}</TableCell>
                    <TableCell>{Math.round(s.durationSec / 60)}m</TableCell>
                    <TableCell className="font-medium">{s.app}</TableCell>
                    <TableCell className="text-muted-foreground">{s.window}</TableCell>
                    <TableCell>
                      <Badge
                        variant={s.productivity === 'productive' ? 'default' : s.productivity === 'unproductive' ? 'destructive' : 'secondary'}
                      >
                        {s.productivity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Long breaks */}
        <Card>
          <CardHeader>
            <CardTitle>Long Breaks</CardTitle>
            <CardDescription>Breaks longer than your idle/break thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {idle.longBreaks.map((b, idx) => (
              <div key={`${b.start}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{b.reason}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(b.start).toLocaleTimeString()} – {new Date(b.end).toLocaleTimeString()}
                  </div>
                </div>
                <Badge variant="secondary">{b.durationMin} min</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
