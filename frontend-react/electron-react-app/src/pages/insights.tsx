import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { ChartBar } from "components/ui/chart-bar"
import { ChartLine } from "components/ui/chart-line"
import { ChartPieLegend } from "components/ui/chart-pie-legend"
import { useAppsData, useSwitchesData } from "providers/dashboard-data-provider"

export function InsightsPage() {
  const apps = useAppsData()
  const switches = useSwitchesData()

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Insights" 
        description="Deep dive into app usage, categories, and switching"
      />

      <div className="space-y-8 px-6">
        {/* Apps & Categories */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usage by App</h3>
            <ChartBar data={apps.usageByApp.points} config={apps.usageByApp.config} />
          </div>
          <ChartPieLegend 
            data={apps.categoryDistribution.slices} 
            config={apps.categoryDistribution.config}
            title="Category Distribution"
            description="How your time splits across categories"
          />
        </div>

        {/* Productivity vs Unproductive & Switch Intensity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Productive vs Unproductive (by App)</h3>
            <ChartBar data={apps.productiveVsUnproductive.points} config={apps.productiveVsUnproductive.config} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Switch Intensity</h3>
            <ChartBar data={switches.switchIntensity.points} config={switches.switchIntensity.config} />
          </div>
        </div>

        {/* Switching trend */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Context Switches Over Time</h3>
          <ChartLine data={switches.switchesOverTime.points} config={switches.switchesOverTime.config} />
        </div>

        {/* Top app/domain sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sessions</CardTitle>
            <CardDescription>Apps and domains with highest focused usage</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Total Time (min)</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Avg Session (min)</TableHead>
                  <TableHead>Productivity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.sessions.map((s, idx) => (
                  <TableRow key={`${s.app}-${s.domain ?? 'none'}-${idx}`}>
                    <TableCell className="font-medium">{s.app}</TableCell>
                    <TableCell className="text-muted-foreground">{s.domain ?? '-'}</TableCell>
                    <TableCell>{s.totalTime}</TableCell>
                    <TableCell>{s.sessions}</TableCell>
                    <TableCell>{s.avgSession}</TableCell>
                    <TableCell>
                      <Badge variant={s.productivity >= 70 ? 'default' : s.productivity >= 40 ? 'secondary' : 'destructive'}>
                        {s.productivity}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

