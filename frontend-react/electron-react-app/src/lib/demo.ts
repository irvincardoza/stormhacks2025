import { dashboardMockData, type DashboardData } from "../data/dashboard"

// Demo flag: gated by REACT_APP_DEMO_MOCKS ("true" | "1")
export const isDemo: boolean =
  (process.env.REACT_APP_DEMO_MOCKS ?? "").toLowerCase() === "true" ||
  process.env.REACT_APP_DEMO_MOCKS === "1"

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pad2(n: number) {
  return n.toString().padStart(2, "0")
}

function hoursBackLabels(count: number, stepHours = 1) {
  const now = new Date()
  const arr: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * stepHours * 60 * 60 * 1000)
    arr.push(`${pad2(d.getHours())}:00`)
  }
  return arr
}

function halfHourSlots(count: number) {
  const now = new Date()
  const arr: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 30 * 60 * 1000)
    arr.push(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`)
  }
  return arr
}

function randomAround(base: number, spread: number) {
  const delta = (Math.random() * 2 - 1) * spread
  return Math.max(0, base + delta)
}

function recentIso(offsetMinutes: number) {
  const d = new Date(Date.now() - offsetMinutes * 60 * 1000)
  return d.toISOString()
}

export function buildDemoDashboardData(): DashboardData {
  // Start from static configs for colors/labels and adjust values dynamically
  const base = dashboardMockData

  // Overview: Hourly productivity anchored to current hour, realistic contrast
  const hourLabels = hoursBackLabels(9)
  const hourlyPoints = hourLabels.map((name, idx) => {
    // Shape: ramp up mid-day, taper late
    const phase = idx / (hourLabels.length - 1)
    const baseProd = 30 + 40 * Math.sin(Math.PI * clamp(phase, 0, 1))
    const prod = Math.round(randomAround(baseProd, 8))
    const unprod = Math.round(clamp(randomAround(20 - 10 * Math.sin(Math.PI * phase), 6), 5, 35))
    return { name, productive: prod, unproductive: unprod }
  })

  // Overview: varied pie chart slices that look believable
  const pb = {
    Productive: 58,
    Unproductive: 18,
    Neutral: 14,
    Idle: 7,
    Other: 3,
  }
  const pieSlices = Object.entries(pb).map(([name, value]) => ({
    name,
    value,
    color: (base.overview.productivityBreakdown.config as any)?.[name]?.color,
  }))

  // Focus: recent sessions (anchored to now)
  const sessions = [
    { app: "VS Code", window: "Mira/src/components/", durationMin: 72 },
    { app: "Chrome", window: "github.com/project/issues", durationMin: 34 },
    { app: "Figma", window: "Dashboard v2", durationMin: 58 },
    { app: "Slack", window: "#product-team", durationMin: 18 },
    { app: "Terminal", window: "npm run dev", durationMin: 25 },
  ].map((s, i) => {
    const end = new Date()
    const start = new Date(end.getTime() - s.durationMin * 60 * 1000 - i * 15 * 60 * 1000)
    return {
      id: `${i + 1}`,
      start: start.toISOString(),
      end: end.toISOString(),
      durationSec: s.durationMin * 60,
      app: s.app,
      window: s.window,
      productivity: s.app === "Slack" ? ("neutral" as const) : ("productive" as const),
    }
  })

  // Focus: minutes by category (we'll convert to hours in UI when demo)
  const categoryMinutesPoints = [
    { name: "Coding", minutes: 230 },
    { name: "Design", minutes: 120 },
    { name: "Docs", minutes: 65 },
    { name: "Meetings", minutes: 95 },
    { name: "Email", minutes: 40 },
    { name: "Browsing", minutes: 55 },
    { name: "AI Ops", minutes: 36 },
  ]

  // Focus: session distribution (counts by buckets)
  const sessionDist = [
    { name: "0-15m", sessions: 2 },
    { name: "15-30m", sessions: 4 },
    { name: "30-45m", sessions: 6 },
    { name: "45-60m", sessions: 7 },
    { name: "60-90m", sessions: 4 },
    { name: "90m+", sessions: 2 },
  ]

  // Idle: time series over last 8 half-hours with some variance
  const halfSlots = halfHourSlots(10)
  const idleSeries = halfSlots.map((name, idx) => ({
    name,
    idleMin: Math.round(clamp(randomAround(5 + 6 * Math.sin((idx / halfSlots.length) * Math.PI), 4), 0, 18)),
  }))

  // Idle: believable long breaks anchored to today
  const day = new Date()
  const mkAt = (h: number, m: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m)
  const longBreaks = [
    { start: mkAt(12, 15), end: mkAt(12, 55), durationMin: 40, reason: "Lunch" },
    { start: mkAt(16, 20), end: mkAt(16, 45), durationMin: 25, reason: "Walk" },
  ].map((b) => ({ ...b, start: b.start.toISOString(), end: b.end.toISOString() }))

  // Demo tracked time: n hours from 8am local time (default caps at 5h to align with 8–13 window),
  // or override via REACT_APP_DEMO_HOURS_FROM_8 (no cap when explicitly provided).
  const envHoursRaw = process.env.REACT_APP_DEMO_HOURS_FROM_8
  const envHours = envHoursRaw !== undefined ? Number(envHoursRaw) : NaN
  const isEnvHoursValid = Number.isFinite(envHours) && envHours >= 0
  const minutesFrom8 = (() => {
    if (isEnvHoursValid) {
      return Math.round(envHours * 60)
    }
    const now = new Date()
    const eight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0)
    const diffMs = now.getTime() - eight.getTime()
    const diffMin = Math.max(0, Math.floor(diffMs / 60000))
    // Cap at 5 hours (8am–1pm) to match chart window if no override set
    return clamp(diffMin, 0, 5 * 60)
  })()

  // Timeline: a few recent activity events
  const activityEvents = [
    { app: "VS Code", window: "src/pages/sessions.tsx", domain: null, idleSec: 0, category: "Development", productivity: "productive" as const },
    { app: "Chrome", window: "openai.com/research", domain: "openai.com", idleSec: 0, category: "Research", productivity: "productive" as const },
    { app: "Slack", window: "#design-review", domain: "slack.com", idleSec: 0, category: "Communication", productivity: "neutral" as const },
    { app: "Twitter", window: "Home / X", domain: "twitter.com", idleSec: 0, category: "Social", productivity: "unproductive" as const },
    { app: "System", window: "Idle", domain: null, idleSec: 300, category: "Idle", productivity: "idle" as const },
  ].map((e, i) => ({ ...e, ts: recentIso(i * 3) }))

  return {
    overview: {
      productivityBreakdown: {
        slices: pieSlices,
        config: base.overview.productivityBreakdown.config,
      },
      hourlyProductivity: {
        points: hourlyPoints,
        config: base.overview.hourlyProductivity.config,
      },
      contextSwitchTrend: base.overview.contextSwitchTrend,
      weeklyProductivity: base.overview.weeklyProductivity,
    },
    focus: {
      sessions,
      categoryMinutes: {
        points: categoryMinutesPoints,
        config: { minutes: { label: "Focus Time (minutes)", color: "hsl(var(--chart-1))" } },
      },
      sessionDistribution: {
        points: sessionDist,
        config: { sessions: { label: "Sessions", color: "hsl(var(--chart-2))" } },
      },
      focusScoreTrend: base.focus.focusScoreTrend,
      goalMinutes: 180,
    },
    idle: {
      idleOverTime: {
        points: idleSeries,
        config: { idleMin: { label: "Idle Minutes", color: "hsl(var(--chart-3))" } },
      },
      longBreaks,
      trackedMinutes: minutesFrom8,
    },
    apps: base.apps,
    switches: base.switches,
    timeline: {
      dailyTimeline: base.timeline.dailyTimeline,
      activityEvents,
    },
    settings: base.settings,
  }
}
