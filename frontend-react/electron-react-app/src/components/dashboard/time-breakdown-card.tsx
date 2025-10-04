import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { timeCategories } from "data/dashboard"

export function TimeBreakdownCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-card-foreground">Time breakdown</CardTitle>
        <p className="text-xs text-muted-foreground">
          Weighted distribution across projects & rituals
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {timeCategories.map((category) => (
          <div key={category.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>{category.name}</span>
              <span className="text-muted-foreground">
                {category.percent}% · {category.duration}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/20">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${category.percent}%`,
                  background: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
