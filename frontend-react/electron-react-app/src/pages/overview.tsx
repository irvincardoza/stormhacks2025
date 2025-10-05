import { PageHeader } from "../components/dashboard/page-header"
import { ChartPieLegend } from "../components/ui/chart-pie-legend"
import { ChartArea } from "../components/ui/chart-area"
import { ChartLine } from "../components/ui/chart-line"
import { useOverviewData } from "../providers/dashboard-data-provider"

export function OverviewPage() {
  const {
    productivityBreakdown,
    hourlyProductivity,
    contextSwitchTrend,
    weeklyProductivity,
  } = useOverviewData()

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Overview" 
        description="High-level health check of your productivity today"
      />
      
      <div className="space-y-8 px-6">
        {/* Full width hourly productivity chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hourly Productivity</h3>
          <ChartArea 
            data={hourlyProductivity.points}
            config={hourlyProductivity.config}
          />
        </div>

        {/* Two column layout for remaining charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <ChartPieLegend 
              data={productivityBreakdown.slices}
              config={productivityBreakdown.config}
              title="Productivity Breakdown"
              description="Today's productivity distribution"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Context Switches Over Time</h3>
            <ChartLine 
              data={contextSwitchTrend.points}
              config={contextSwitchTrend.config}
            />
          </div>
        </div>

        {/* Full width weekly productivity trend */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Weekly Productivity Trend</h3>
          <ChartLine 
            data={weeklyProductivity.points}
            config={weeklyProductivity.config}
          />
        </div>
      </div>
    </div>
  )
}
