import { PageHeader } from "components/dashboard/page-header"
import { ChartDonut } from "components/ui/chart-donut"
import { ChartBar } from "components/ui/chart-bar"
import { ChartLine } from "components/ui/chart-line"

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Overview" 
        description="High-level health check of your productivity today"
      />
      
      <div className="space-y-8 px-6">
        {/* Main Productivity Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Productivity Breakdown</h3>
            <ChartDonut 
              data={[
                { name: "Productive", value: 275, color: "hsl(var(--chart-1))" },
                { name: "Unproductive", value: 200, color: "hsl(var(--chart-2))" },
                { name: "Neutral", value: 187, color: "hsl(var(--chart-3))" },
                { name: "Idle", value: 173, color: "hsl(var(--chart-4))" },
                { name: "Other", value: 90, color: "hsl(var(--chart-5))" },
              ]}
              config={{
                productive: { label: "Productive", color: "hsl(var(--chart-1))" },
                unproductive: { label: "Unproductive", color: "hsl(var(--chart-2))" },
                neutral: { label: "Neutral", color: "hsl(var(--chart-3))" },
                idle: { label: "Idle", color: "hsl(var(--chart-4))" },
                other: { label: "Other", color: "hsl(var(--chart-5))" },
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hourly Productivity</h3>
            <ChartBar 
              data={[
                { name: "09:00", productive: 45, unproductive: 15 },
                { name: "10:00", productive: 60, unproductive: 20 },
                { name: "11:00", productive: 30, unproductive: 30 },
                { name: "12:00", productive: 15, unproductive: 45 },
                { name: "13:00", productive: 20, unproductive: 40 },
                { name: "14:00", productive: 55, unproductive: 25 },
                { name: "15:00", productive: 40, unproductive: 20 },
                { name: "16:00", productive: 35, unproductive: 25 },
                { name: "17:00", productive: 25, unproductive: 35 },
              ]}
              config={{
                productive: { label: "Productive", color: "hsl(var(--chart-1))" },
                unproductive: { label: "Unproductive", color: "hsl(var(--chart-2))" },
              }}
            />
          </div>
        </div>

        {/* Secondary Metrics */}
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
            <h3 className="text-lg font-semibold">Weekly Productivity Trend</h3>
            <ChartLine 
              data={[
                { name: "Mon", productivity: 85 },
                { name: "Tue", productivity: 92 },
                { name: "Wed", productivity: 78 },
                { name: "Thu", productivity: 88 },
                { name: "Fri", productivity: 95 },
              ]}
              config={{
                productivity: { label: "Productivity", color: "hsl(var(--chart-2))" },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
