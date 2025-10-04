import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table"
import { Button } from "components/ui/button"
import { ChartLineInteractive } from "components/charts/chart-line-interactive"
import { ChartBarInteractive } from "components/charts/chart-bar-interactive"
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
        {/* Switches per Hour */}
        <ChartLineInteractive />

        {/* Switch Intensity Bins */}
        <ChartBarInteractive />

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
