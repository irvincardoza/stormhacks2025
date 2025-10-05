import { PageHeader } from "components/dashboard/page-header"
import { ChartBar } from "components/ui/chart-bar"
import { ChartBarStacked } from "components/ui/chart-bar-stacked"
import { useAppsData, useTimelineData } from "providers/dashboard-data-provider"
import { useMemo } from "react"
import { normalizeStackToPercent } from "lib/chart-utils"

export function InsightsPage() {
  const apps = useAppsData()
  const { dailyTimeline } = useTimelineData()

  // Normalize each hour's values so stacked bars represent 100% of tracked time in that hour
  const normalizedDailyPoints = useMemo(
    () => normalizeStackToPercent(dailyTimeline?.points || [], dailyTimeline?.config || ({} as any)),
    [dailyTimeline]
  )

  // Apply a distinct pastel palette (no blue) while preserving labels
  const pastelTimelineConfig = useMemo(() => {
    const base = dailyTimeline?.config || ({} as any)
    const colorByKey: Record<string, string> = {
      "VS Code": "#CDECCF",   // mint
      "Chrome": "#F9D5E5",    // soft pink
      "Figma": "#FDE2A7",     // butter yellow
      "Slack": "#EADCF8",     // lavender
      "Terminal": "#FFD6C9",  // peach
      "System": "#E8E2D0",    // sand
    }
    const entries = Object.entries(base).map(([key, item]) => {
      const desired = (colorByKey as any)[key] || (item as any).color || "#E5E7EB"
      return [
        key,
        {
          label: (item as any)?.label ?? key,
          color: desired,
        },
      ]
    })
    return Object.fromEntries(entries)
  }, [dailyTimeline])

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Insights" 
        description="Deep dive into app usage and your daily timeline"
      />

      <div className="space-y-8 px-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usage by App</h3>
            <ChartBar data={apps.usageByApp.points} config={apps.usageByApp.config} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Daily Timeline</h3>
            <ChartBarStacked 
              data={normalizedDailyPoints}
              config={pastelTimelineConfig}
              title="Daily Timeline"
              description="Percent of tracked time per app, by hour (stacks to 100%)"
              showFooter={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
