import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { ScrollArea } from "components/ui/scroll-area"
import { activityLog } from "data/dashboard"

export function ActivityCard() {
  return (
    <Card className="border-border">
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
      return "bg-success/20 text-success border-success/30" // Bright lime for success
    case "review":
      return "bg-info/20 text-info border-info/30" // Blue for review
    case "deep-work":
      return "bg-accent-orange text-white border-accent-orange" // Vibrant orange for deep work
    case "break":
      return "bg-warning/20 text-warning border-warning/30" // Light yellow for breaks
    case "idle":
      return "bg-accent-teal/20 text-accent-teal border-accent-teal/30" // Teal for idle
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}
