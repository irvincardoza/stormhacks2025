import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { Button } from "components/ui/button"
import { ChartLine } from "components/ui/chart-line"
import { ChartBar } from "components/ui/chart-bar"
import { MoreHorizontal } from "components/icons/lucide-adapter"

// Mock data for switches
const topSwitchPairs = [
  { from: "VS Code", to: "Chrome", count: 12 },
  { from: "Chrome", to: "VS Code", count: 10 },
  { from: "VS Code", to: "Terminal", count: 8 },
  { from: "Slack", to: "VS Code", count: 6 },
  { from: "Figma", to: "VS Code", count: 5 },
  { from: "Chrome", to: "Slack", count: 4 },
  { from: "Terminal", to: "VS Code", count: 4 },
  { from: "VS Code", to: "Slack", count: 3 },
]

export function SwitchesPage() {

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Switches" 
        description="Quantify context switching and fragmentation"
      />
      
      <div className="grid gap-6 px-6">
        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Context Switches Over Time</h3>
            <ChartLine 
              data={[
                { name: "09:00", switches: 3 },
                { name: "10:00", switches: 7 },
                { name: "11:00", switches: 5 },
                { name: "12:00", switches: 2 },
                { name: "13:00", switches: 1 },
                { name: "14:00", switches: 8 },
                { name: "15:00", switches: 4 },
                { name: "16:00", switches: 6 },
                { name: "17:00", switches: 3 },
              ]}
              config={{
                switches: { label: "Switches", color: "hsl(var(--chart-1))" },
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Switch Intensity Distribution</h3>
            <ChartBar 
              data={[
                { name: "0-5", count: 2 },
                { name: "5-10", count: 5 },
                { name: "10-15", count: 8 },
                { name: "15-20", count: 12 },
                { name: "20-25", count: 6 },
                { name: "25+", count: 3 },
              ]}
              config={{
                count: { label: "Sessions", color: "hsl(var(--chart-2))" },
              }}
            />
          </div>
        </div>

        {/* Top Switch Pairs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Switch Pairs</CardTitle>
            <CardDescription>
              Most common application transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{topSwitchPairs.length} pairs</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSwitchPairs.map((pair, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pair.from}</TableCell>
                      <TableCell className="font-medium">{pair.to}</TableCell>
                      <TableCell>{pair.count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(pair.count / Math.max(...topSwitchPairs.map(p => p.count))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            {Math.round((pair.count / 52) * 100)}%
                          </span>
                        </div>
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
