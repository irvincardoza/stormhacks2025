import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Progress } from "components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { Button } from "components/ui/button"
import { ChartLine } from "components/ui/chart-line"
import { MoreHorizontal, Clock } from "components/icons/lucide-adapter"

// Mock data for idle and breaks
const idleOverTime = [
  { t: "09:00", idleMin: 0 },
  { t: "09:30", idleMin: 0 },
  { t: "10:00", idleMin: 5 },
  { t: "10:30", idleMin: 0 },
  { t: "11:00", idleMin: 0 },
  { t: "11:30", idleMin: 0 },
  { t: "12:00", idleMin: 30 },
  { t: "12:30", idleMin: 30 },
  { t: "13:00", idleMin: 0 },
  { t: "13:30", idleMin: 0 },
  { t: "14:00", idleMin: 0 },
  { t: "14:30", idleMin: 0 },
  { t: "15:00", idleMin: 0 },
  { t: "15:30", idleMin: 0 },
  { t: "16:00", idleMin: 0 },
  { t: "16:30", idleMin: 0 },
  { t: "17:00", idleMin: 0 },
]

const longBreaks = [
  { start: "12:00", end: "12:30", durationMin: 30, reason: "Lunch break" },
  { start: "15:15", end: "15:20", durationMin: 5, reason: "Coffee break" },
  { start: "16:45", end: "16:50", durationMin: 5, reason: "Stretch break" },
]

export function IdlePage() {
  const totalIdleTime = idleOverTime.reduce((acc, point) => acc + point.idleMin, 0)
  const totalTrackedTime = 480 // 8 hours in minutes
  const idlePercentage = Math.round((totalIdleTime / totalTrackedTime) * 100)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Idle & Breaks" 
        description="Understand true breaks vs. disengagement"
      />
      
      <div className="grid gap-6 px-6">
        {/* Idle Stats and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Idle Time Percentage</CardTitle>
              <CardDescription>
                How much of your tracked time was idle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary">{idlePercentage}%</div>
                  <div className="text-sm text-muted-foreground mt-2">Idle time</div>
                  <Progress value={idlePercentage} className="w-32 mt-4" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {totalIdleTime}m of {totalTrackedTime}m tracked
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Idle Over Time */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Idle Time Throughout the Day</h3>
            <ChartLine 
              data={idleOverTime}
              config={{
                idleMin: { label: "Idle Time (minutes)", color: "hsl(var(--chart-1))" },
              }}
            />
          </div>
        </div>

        {/* Long Breaks List */}
        <Card>
          <CardHeader>
            <CardTitle>Long Breaks</CardTitle>
            <CardDescription>
              Breaks longer than 15 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{longBreaks.length} breaks</Badge>
                  <Badge variant="outline">
                    {longBreaks.reduce((acc, break_) => acc + break_.durationMin, 0)}m total
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {longBreaks.map((break_, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{break_.start}</TableCell>
                      <TableCell className="font-mono text-sm">{break_.end}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{break_.durationMin}m</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{break_.reason}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Break Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Break Insights</CardTitle>
            <CardDescription>
              Analysis of your break patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{longBreaks.length}</div>
                <div className="text-sm text-muted-foreground">Long breaks</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {Math.round(longBreaks.reduce((acc, b) => acc + b.durationMin, 0) / longBreaks.length)}m
                </div>
                <div className="text-sm text-muted-foreground">Avg break length</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{idlePercentage}%</div>
                <div className="text-sm text-muted-foreground">Idle percentage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
