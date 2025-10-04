import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { projectBreakdown } from "data/dashboard"

export function ProjectsCard() {
  return (
    <Card className="border-border/40 bg-card/70 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Projects</CardTitle>
        <p className="text-xs text-muted-foreground">
          AI attribution of time invested by initiative
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {projectBreakdown.map((project) => (
          <div key={project.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>{project.name}</span>
              <span className="text-muted-foreground">
                {project.percent}% · {project.duration}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/20">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${project.percent}%`,
                  background: project.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
