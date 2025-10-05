import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { ChartBarStacked } from "components/ui/chart-bar-stacked"
import { useTimelineData } from "providers/dashboard-data-provider"
import { normalizeStackToPercent } from "lib/chart-utils"

export function TimelineCard() {
  const { dailyTimeline } = useTimelineData()
  const normalized = useMemo(
    () => normalizeStackToPercent(dailyTimeline?.points || [], dailyTimeline?.config || ({} as any)),
    [dailyTimeline]
  )

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-card-foreground">Timeline</CardTitle>
          <p className="text-xs text-muted-foreground">App usage distribution by hour</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-[10px] uppercase tracking-widest">
          Live
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartBarStacked
          data={normalized}
          config={dailyTimeline?.config || ({} as any)}
          title="Daily Timeline"
          description="Percent of tracked time per app, 8am–1pm"
          showFooter={false}
        />
      </CardContent>
    </Card>
  )
}
