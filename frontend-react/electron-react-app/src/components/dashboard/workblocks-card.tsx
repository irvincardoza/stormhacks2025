import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { workBlocks } from "data/dashboard"
import { cn } from "lib/utils"
import { Clock3, Target, Home, Sparkles, Brain } from "components/icons/lucide-adapter"

const categoryStyles: Record<string, string> = {
  focus: "bg-chart-1/15 text-chart-1",
  meeting: "bg-chart-2/15 text-chart-2",
  break: "bg-chart-3/15 text-chart-3",
  "deep-work": "bg-primary/15 text-primary",
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  focus: Target,
  meeting: Home,
  break: Sparkles,
  "deep-work": Brain,
}

export function WorkBlocksCard() {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Workblocks</CardTitle>
        <p className="text-xs text-muted-foreground">
          AI quality score for each block of uninterrupted time
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {workBlocks.map((block) => (
          <div
            key={`${block.time}-${block.task}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/5 px-3 py-2"
          >
            <div className="flex items-center gap-3 text-xs md:text-sm">
              <div className="text-muted-foreground/80 w-12 tabular-nums flex items-center gap-1">
                <Clock3 className="size-3" />
                {block.time}
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = categoryIcons[block.category]
                  return IconComponent ? (
                    <IconComponent className="size-4 text-muted-foreground" />
                  ) : null
                })()}
                <div>
                  <p className="font-medium leading-tight">{block.task}</p>
                  <p className="text-muted-foreground text-xs">
                    {block.durationMinutes} min · Flow score {block.quality}
                  </p>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "border-transparent text-xs",
                categoryStyles[block.category] ?? ""
              )}
            >
              {block.category.replace("-", " ")}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
