import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Progress } from "components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import { Separator } from "components/ui/separator"
import { CalendarClock, Clock3, Play, Power } from "components/icons/lucide-adapter"

const focusRatio = 0.981

export function WorkHoursCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-card-foreground">Work hours</CardTitle>
          <p className="text-xs text-muted-foreground">
            Tracking window 08:00 — 18:00
          </p>
        </div>
        <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
          On schedule
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="bg-muted/20">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
          <TabsContent value="day" className="mt-4 space-y-4">
            <StatsRow total="7 hr 51 min" productive="98.1%" status="Tracking" />
          </TabsContent>
          <TabsContent value="week" className="mt-4 space-y-4">
            <StatsRow total="39 hr 14 min" productive="94.2%" status="Auto" />
          </TabsContent>
        </Tabs>
        <Separator className="bg-border/40" />
        <Dialog>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Focus to workday
              </p>
              <p className="text-sm font-medium">{Math.round(focusRatio * 1000) / 10}% of target</p>
              <Progress value={focusRatio * 100} className="mt-2" />
            </div>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2 border-accent-orange/40 text-accent-orange hover:bg-accent-orange/10">
                <CalendarClock className="size-4" />
                AI Adjustments
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="max-w-md border-border/40 bg-background/95 backdrop-blur">
            <DialogHeader>
              <DialogTitle>AI schedule suggestions</DialogTitle>
              <DialogDescription>
                Tuned to your circadian pattern and collaboration windows.
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-3 text-sm">
              <li className="rounded-lg border border-accent-orange/20 bg-accent-orange/5 p-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-accent-orange" />
                  <span className="font-medium">Protect focus arc 09:40 → 11:20</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Calendar blocks created and teammates notified of async mode.
                </p>
              </li>
              <li className="rounded-lg border border-info/20 bg-info/5 p-3">
                <div className="flex items-center gap-2">
                  <Power className="size-4 text-info" />
                  <span className="font-medium">Disable tracking @ 19:00</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reduce decision fatigue—AI will re-enable tomorrow morning.
                </p>
              </li>
              <li className="rounded-lg border border-accent-teal/20 bg-accent-teal/5 p-3">
                <div className="flex items-center gap-2">
                  <Play className="size-4 text-accent-teal" />
                  <span className="font-medium">Break cadence update</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  7 min regenerative flow scheduled for 16:20 after investor prep.
                </p>
              </li>
            </ul>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

type StatsRowProps = {
  total: string
  productive: string
  status: string
}

function StatsRow({ total, productive, status }: StatsRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/5 px-4 py-3">
      <div>
        <p className="text-xs text-muted-foreground">Total time worked</p>
        <p className="text-lg font-semibold">{total}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Percent of day</p>
        <p className="text-lg font-semibold">{productive}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Tracking</p>
        <p className="text-lg font-semibold">{status}</p>
      </div>
    </div>
  )
}
