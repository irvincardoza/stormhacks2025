import { PageHeader } from "components/dashboard/page-header"
import { ChartPieSeparatorNone } from "components/charts/chart-pie-separator-none"
import { ChartBarInteractive } from "components/charts/chart-bar-interactive"
import { ChartLineInteractive } from "components/charts/chart-line-interactive"

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Overview" 
        description="High-level health check of your productivity today"
      />
      
      <div className="grid gap-6 px-6">
        {/* Productivity Donut */}
        <ChartPieSeparatorNone />

        {/* Top Apps */}
        <ChartBarInteractive />

        {/* Switches per Hour */}
        <ChartLineInteractive />

        {/* Productivity over Time */}
        <ChartLineInteractive />
      </div>
    </div>
  )
}
