import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Progress } from "components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog"
import { breakSuggestions } from "data/dashboard"
import { AlarmClock, Brain, Check, Sparkles } from "components/icons/lucide-adapter"

export function BreakTimerCard() {
  return (
    <Card className="border-border/40">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>Break timer</span>
          <Badge variant="outline" className="border-chart-3/40 text-chart-3">
            Notifications on
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          AI monitors cognitive load and nudges regenerative breaks.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 rounded-xl border border-border/40 bg-muted/5 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Time since break</p>
              <p className="text-2xl font-semibold tracking-tight">0:42:35</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Break to work ratio</p>
              <p className="text-2xl font-semibold tracking-tight">1 / 3.6</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Strain level</p>
              <p className="text-2xl font-semibold tracking-tight text-chart-3">Elevated</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Neural recovery
            </p>
            <Progress value={64} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Cognitive load 64% — AI recommends a regenerative break within 6 minutes.
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full gap-2 bg-chart-3 text-background hover:bg-chart-3/90">
              <AlarmClock className="size-4" /> Start regenerative break
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-border/40 bg-background/95 backdrop-blur">
            <DialogHeader className="space-y-2">
              <DialogTitle>Choose your AI-programmed break</DialogTitle>
              <DialogDescription>
                Options adapt to biometric strain, focus history, and upcoming workload.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {breakSuggestions.map((option) => (
                <button
                  key={option.title}
                  className="group flex w-full flex-col gap-1 rounded-lg border border-border/50 bg-muted/10 p-3 text-left transition hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium group-hover:text-primary">
                      {option.title}
                    </span>
                    <Sparkles className="size-3.5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3 text-primary" />
                <span>AI will pause desktop notifications automatically.</span>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <Brain className="size-3" /> Auto-pick for me
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
