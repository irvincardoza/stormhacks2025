import { useState, useEffect, useMemo } from "react"
import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "components/ui/tabs"
import {
  CalendarDays,
  Clock,
  Target,
  TrendingUp,
} from "components/icons/lucide-adapter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { useOverviewData, useSwitchesData, useFocusData, useIdleData } from "providers/dashboard-data-provider"

type PageHeaderProps = {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const overview = useOverviewData()
  const switches = useSwitchesData()
  const focus = useFocusData()
  const idle = useIdleData()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    if (h <= 0) return `${m}m`
    return `${h}h ${m}m`
  }

  const trackedTimeLabel = useMemo(() => formatMinutes(idle.trackedMinutes || 0), [idle.trackedMinutes])

  const productivePercent = useMemo(() => {
    const weekly = overview.weeklyProductivity.points
    if (weekly && weekly.length > 0) {
      return Math.round(weekly[weekly.length - 1].productivity)
    }
    // Fallback: average hourly percentages if available
    const hourly = overview.hourlyProductivity.points
    if (hourly && hourly.length > 0) {
      const sumProd = hourly.reduce((acc, p) => acc + (p.productive || 0), 0)
      return Math.round(sumProd / hourly.length)
    }
    return 0
  }, [overview])

  const productiveDelta = useMemo(() => {
    const weekly = overview.weeklyProductivity.points
    if (weekly && weekly.length > 1) {
      const today = weekly[weekly.length - 1].productivity
      const prev = weekly[weekly.length - 2].productivity
      const delta = Math.round((today - prev) * 10) / 10
      return delta
    }
    return null
  }, [overview])

  const totalSwitches = useMemo(() => {
    return (switches.switchesOverTime.points || []).reduce((acc, p) => acc + (p.switches || 0), 0)
  }, [switches])

  const longestFocusLabel = useMemo(() => {
    const longestSec = Math.max(0, ...(focus.sessions || []).map((s) => s.durationSec))
    return formatMinutes(Math.round(longestSec / 60))
  }, [focus])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-border/0 px-6 py-4 md:flex-row md:items-center md:justify-between glass-card rounded-xl mx-6 mt-6">
        <div className="flex flex-1 items-center gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <h1 className="text-6xl font-black tracking-tight text-gradient">{title}</h1>
            </div>
            <p className="text-lg font-semibold text-foreground/80">
              {formatDate(currentDate)} • {formatTime(currentDate)}
            </p>
            {description && (
              <p className="mt-3 text-lg font-medium text-foreground/70">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Tabs defaultValue="today" className="hidden md:flex">
            <TabsList className="bg-muted/20">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-border/50">
                <CalendarDays className="size-4" /> Date Range
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Jump to</DropdownMenuLabel>
              <DropdownMenuItem>This week</DropdownMenuItem>
              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem>This month</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Custom range...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 px-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackedTimeLabel}</div>
            <p className="text-xs text-muted-foreground">as of {formatTime(currentDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productive %</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productivePercent}%</div>
            {productiveDelta !== null && (
              <p className="text-xs text-muted-foreground">
                {productiveDelta >= 0 ? "+" : ""}{productiveDelta}% vs yesterday
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Switches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSwitches}</div>
            <p className="text-xs text-muted-foreground">today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Focus</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestFocusLabel}</div>
            <p className="text-xs text-muted-foreground">top session today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
