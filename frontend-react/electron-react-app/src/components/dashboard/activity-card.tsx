import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { ScrollArea } from "components/ui/scroll-area"
import { activityLog } from "data/dashboard"

export function ActivityCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-card-foreground">Activity</CardTitle>
        <p className="text-xs text-muted-foreground">
          Live telemetry from desktop applications and browser tabs
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="divide-y divide-border/40">
            {activityLog.map((log) => (
              <div
                key={`${log.time}-${log.detail}`}
                className="flex items-center gap-3 px-4 py-3 text-xs md:text-sm"
              >
                <span className="w-20 text-muted-foreground/80 tabular-nums">
                  {log.time}
                </span>
                <span className="w-24 text-muted-foreground">{log.app}</span>
                <span className="flex-1 truncate font-medium">{log.detail}</span>
                <Badge variant="outline" className={statusClass(log.status)}>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function statusClass(status: string) {
  switch (status) {
    case "ok":
      return "bg-chart-2 text-chart-2-foreground"
    case "review":
      return "bg-chart-3 text-chart-3-foreground"
    case "deep-work":
      return "bg-primary text-primary-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}
