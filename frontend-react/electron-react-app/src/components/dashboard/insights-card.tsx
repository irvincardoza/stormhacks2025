import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "components/ui/sheet"
import { aiInsights, trackedApps } from "data/dashboard"
import { BrainCircuit, Sparkles } from "components/icons/lucide-adapter"

export function InsightsCard() {
  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">AI insights</CardTitle>
          <p className="text-xs text-muted-foreground">
            Personalized nudges from the Pulse cognitive engine
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary">
          Live
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue={aiInsights[0]?.id ?? "deep-work"} className="w-full">
          <TabsList className="bg-muted/20">
            {aiInsights.map((insight) => (
              <TabsTrigger key={insight.id} value={insight.id} className="text-xs">
                {insight.title.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          {aiInsights.map((insight) => (
            <TabsContent key={insight.id} value={insight.id} className="mt-4">
              <InsightCard {...insight} />
            </TabsContent>
          ))}
        </Tabs>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-primary/40">
              <BrainCircuit className="size-4" />
              View tracked applications
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm border-border/40 bg-background/95 backdrop-blur">
            <SheetHeader>
              <SheetTitle>Context graph</SheetTitle>
              <SheetDescription>
                Time allocation across your most active tools today.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {trackedApps.map((app) => (
                <div key={app.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{app.name}</span>
                    <span className="text-muted-foreground">{app.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/20">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${app.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

type InsightProps = (typeof aiInsights)[number]

function InsightCard({ title, description, action, sentiment }: InsightProps) {
  const sentimentStyles = {
    positive: "from-chart-1/40 to-primary/10",
    neutral: "from-muted/30 to-muted/10",
    warning: "from-chart-3/30 to-chart-3/10",
  } as const

  return (
    <div className={`rounded-xl border border-border/40 bg-gradient-to-br p-4 ${sentimentStyles[sentiment]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <Sparkles className="size-4 text-primary" />
      </div>
      <Button size="sm" className="mt-4 gap-2 bg-primary/80 text-xs hover:bg-primary">
        <Sparkles className="size-3.5" /> {action}
      </Button>
    </div>
  )
}
