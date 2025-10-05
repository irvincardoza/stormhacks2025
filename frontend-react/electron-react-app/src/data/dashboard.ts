import type { ChartConfig } from "components/ui/chart"

export type TimelineEntry = {
  hour: string
  focus: number
  meetings: number
  breaks: number
}

export type WorkBlock = {
  time: string
  task: string
  durationMinutes: number
  quality: number
  category: "focus" | "meeting" | "break" | "deep-work"
}

export type ActivityLogItem = {
  time: string
  app: string
  detail: string
  status: "ok" | "review" | "deep-work"
}

export type ProjectBreakdown = {
  name: string
  percent: number
  duration: string
  color: string
}

export type ScoreSummary = {
  name: string
  value: number
  duration: string
  color: string
}

export type TimeCategory = {
  name: string
  percent: number
  duration: string
  color: string
}

export type Insight = {
  id: string
  title: string
  description: string
  action: string
  sentiment: "positive" | "neutral" | "warning"
}

export const timelineData: TimelineEntry[] = [
  { hour: "6a", focus: 0, meetings: 0, breaks: 0 },
  { hour: "7a", focus: 10, meetings: 0, breaks: 0 },
  { hour: "8a", focus: 18, meetings: 0, breaks: 2 },
  { hour: "9a", focus: 24, meetings: 6, breaks: 0 },
  { hour: "10a", focus: 28, meetings: 8, breaks: 0 },
  { hour: "11a", focus: 32, meetings: 4, breaks: 4 },
  { hour: "12p", focus: 18, meetings: 4, breaks: 12 },
  { hour: "1p", focus: 34, meetings: 8, breaks: 4 },
  { hour: "2p", focus: 30, meetings: 10, breaks: 4 },
  { hour: "3p", focus: 28, meetings: 6, breaks: 2 },
  { hour: "4p", focus: 22, meetings: 4, breaks: 4 },
  { hour: "5p", focus: 18, meetings: 0, breaks: 6 },
  { hour: "6p", focus: 12, meetings: 0, breaks: 8 },
  { hour: "7p", focus: 6, meetings: 0, breaks: 4 },
  { hour: "8p", focus: 0, meetings: 0, breaks: 0 },
]

export const workBlocks: WorkBlock[] = [
  { time: "9:00", task: "Daily Stand-Up", durationMinutes: 32, quality: 92, category: "meeting" },
  { time: "10:03", task: "Deep Code Session", durationMinutes: 70, quality: 97, category: "focus" },
  { time: "11:24", task: "Documentation", durationMinutes: 34, quality: 89, category: "focus" },
  { time: "12:57", task: "Product Design Review", durationMinutes: 45, quality: 88, category: "focus" },
  { time: "13:49", task: "AI Research Sprint", durationMinutes: 23, quality: 95, category: "deep-work" },
  { time: "14:45", task: "Mentorship Sync", durationMinutes: 20, quality: 90, category: "meeting" },
  { time: "16:05", task: "Investor Prep", durationMinutes: 42, quality: 87, category: "meeting" },
  { time: "17:10", task: "Weekly Summary", durationMinutes: 39, quality: 96, category: "focus" },
]

export const activityLog: ActivityLogItem[] = [
  { time: "18:04:33", app: "Chrome", detail: "twitter.com/home", status: "review" },
  { time: "18:01:15", app: "Superhuman", detail: "Inbox – unread", status: "ok" },
  { time: "18:01:10", app: "Airtable", detail: "Product roadmap", status: "ok" },
  { time: "18:00:03", app: "Slack", detail: "General", status: "ok" },
  { time: "17:57:29", app: "Superhuman", detail: "Investor follow-ups", status: "ok" },
  { time: "17:56:14", app: "Chrome", detail: "rize.io/settings/notifications", status: "ok" },
  { time: "17:53:01", app: "Chrome", detail: "rize.io/settings", status: "ok" },
  { time: "17:49:58", app: "Slack", detail: "Product Team", status: "ok" },
  { time: "17:49:50", app: "Figma", detail: "Dashboard v2", status: "deep-work" },
  { time: "17:47:21", app: "VS Code", detail: "timeline.tsx", status: "ok" },
]

export const projectBreakdown: ProjectBreakdown[] = [
  { name: "MVP Release", percent: 45, duration: "2h 46m", color: "hsl(var(--chart-1))" },
  { name: "AI Agent", percent: 22, duration: "1h 21m", color: "hsl(var(--chart-2))" },
  { name: "Bugs & Fixes", percent: 14, duration: "50m", color: "hsl(var(--chart-3))" },
  { name: "Investor Prep", percent: 11, duration: "32m", color: "hsl(var(--chart-4))" },
  { name: "Learning", percent: 8, duration: "24m", color: "hsl(var(--chart-5))" },
]

export const scoreSummary: ScoreSummary[] = [
  { name: "Focus", value: 62, duration: "3h 43m", color: "hsl(var(--chart-1))" },
  { name: "Meetings", value: 21, duration: "55m", color: "hsl(var(--chart-2))" },
  { name: "Breaks", value: 17, duration: "1h 12m", color: "hsl(var(--chart-3))" },
]

export const timeCategories: TimeCategory[] = [
  { name: "Code", percent: 45, duration: "2h 46m", color: "hsl(var(--chart-1))" },
  { name: "Meetings", percent: 18, duration: "1h 25m", color: "hsl(var(--chart-2))" },
  { name: "Documentation", percent: 14, duration: "1h 15m", color: "hsl(var(--chart-3))" },
  { name: "Design", percent: 10, duration: "45m", color: "hsl(var(--chart-4))" },
  { name: "Messaging", percent: 6, duration: "23m", color: "hsl(var(--chart-5))" },
  { name: "Email", percent: 4, duration: "20m", color: "hsl(var(--chart-3))" },
  { name: "Task Mgmt", percent: 3, duration: "11m", color: "hsl(var(--chart-4))" },
  { name: "AI Ops", percent: 2, duration: "8m", color: "hsl(var(--chart-1))" },
]

export const aiInsights: Insight[] = [
  {
    id: "deep-work",
    title: "Deep work streak achieved",
    description:
      "You maintained focus for 93 minutes with only one context switch. Schedule a neural recharge break to keep the streak going.",
    action: "Schedule regenerative break",
    sentiment: "positive",
  },
  {
    id: "meeting-load",
    title: "Meetings trending up",
    description:
      "Meeting time is 18% higher than your weekly average. Consider converting tomorrow's status sync into an async Loom update.",
    action: "Draft async update",
    sentiment: "warning",
  },
  {
    id: "focus-window",
    title: "AI focus window suggested",
    description:
      "Predicted flow period tomorrow between 9:40–11:20. Block calendar and enable ambient soundscape for maximum focus.",
    action: "Block calendar",
    sentiment: "neutral",
  },
]

export const breakSuggestions = [
  {
    title: "Guided reset (7 min)",
    description: "Breathing routine + mobility flow personalized to your focus strain score.",
  },
  {
    title: "Outdoor loop (12 min)",
    description: "Take a quick walk. AI will pause notifications and resume when you're back.",
  },
  {
    title: "Micro meditation (4 min)",
    description: "Recenter with a short AI-guided session tuned to your HRV trend.",
  },
]

export const trackedApps = [
  { name: "Chrome", percent: 38 },
  { name: "VS Code", percent: 24 },
  { name: "Superhuman", percent: 16 },
  { name: "Slack", percent: 12 },
  { name: "Figma", percent: 10 },
]

export type DonutSlice = {
  name: string
  value: number
  color?: string
}

export type NamedMetricPoint<TFields extends string = string> = {
  name: string
} & Record<TFields, number>

export type OverviewData = {
  productivityBreakdown: {
    slices: DonutSlice[]
    config: ChartConfig
  }
  hourlyProductivity: {
    points: NamedMetricPoint<"productive" | "unproductive">[]
    config: ChartConfig
  }
  contextSwitchTrend: {
    points: NamedMetricPoint<"switches">[]
    config: ChartConfig
  }
  weeklyProductivity: {
    points: NamedMetricPoint<"productivity">[]
    config: ChartConfig
  }
}

export type FocusSession = {
  id: string
  start: string
  end: string
  durationSec: number
  app: string
  window: string
  productivity: "productive" | "neutral" | "unproductive"
}

export type FocusData = {
  sessions: FocusSession[]
  categoryMinutes: {
    points: NamedMetricPoint<"minutes">[]
    config: ChartConfig
  }
  sessionDistribution: {
    points: NamedMetricPoint<"sessions">[]
    config: ChartConfig
  }
  focusScoreTrend: {
    points: NamedMetricPoint<"focus">[]
    config: ChartConfig
  }
  goalMinutes: number
}

export type IdleBreak = {
  start: string
  end: string
  durationMin: number
  reason: string
}

export type IdleData = {
  idleOverTime: {
    points: NamedMetricPoint<"idleMin">[]
    config: ChartConfig
  }
  longBreaks: IdleBreak[]
  trackedMinutes: number
}

export type AppSession = {
  app: string
  domain: string | null
  totalTime: number
  sessions: number
  avgSession: number
  productivity: number
}

export type AppsData = {
  usageByApp: {
    points: NamedMetricPoint<"time" | "productivity">[]
    config: ChartConfig
  }
  categoryDistribution: {
    slices: DonutSlice[]
    config: ChartConfig
  }
  productiveVsUnproductive: {
    points: NamedMetricPoint<"productive" | "unproductive">[]
    config: ChartConfig
  }
  sessions: AppSession[]
}

export type SwitchPair = {
  from: string
  to: string
  count: number
}

export type SwitchesData = {
  switchesOverTime: {
    points: NamedMetricPoint<"switches">[]
    config: ChartConfig
  }
  switchIntensity: {
    points: NamedMetricPoint<"count">[]
    config: ChartConfig
  }
  topPairs: SwitchPair[]
}

export type ActivityEvent = {
  ts: string
  app: string
  window: string
  domain: string | null
  idleSec: number
  category: string
  productivity: "productive" | "neutral" | "unproductive" | "idle"
}

export type TimelineData = {
  dailyTimeline: {
    points: NamedMetricPoint<"VS Code" | "Chrome" | "Figma" | "Slack" | "Terminal" | "System">[]
    config: ChartConfig
  }
  activityEvents: ActivityEvent[]
}

export type LabelRule = {
  id: string
  label: string
  resource: string
  resourceType: "application" | "domain"
  productivity: "productive" | "neutral" | "unproductive"
}

export type SettingsData = {
  thresholds: {
    sessionSeconds: number
    idleSeconds: number
    breakMinutes: number
  }
  rules: LabelRule[]
  privacy: {
    redactFilenames: boolean
    hideScreenshots: boolean
    anonymizeDomains: boolean
  }
  dataManagement: {
    retentionDays: number
    exportLabel: string
    deleteLabel: string
  }
  monitorStatus?: {
    unproductive_streak?: boolean
    checked_at?: string
  }
}

export type PartialDashboardData = Partial<DashboardData>

export type DashboardData = {
  overview: OverviewData
  focus: FocusData
  idle: IdleData
  apps: AppsData
  switches: SwitchesData
  timeline: TimelineData
  settings: SettingsData
}

const overviewConfig = {
  productivityBreakdown: {
    slices: [
      { name: "Productive", value: 275, color: "hsl(var(--chart-1))" },
      { name: "Unproductive", value: 200, color: "hsl(var(--chart-2))" },
      { name: "Neutral", value: 187, color: "hsl(var(--chart-3))" },
      { name: "Idle", value: 173, color: "hsl(var(--chart-4))" },
      { name: "Other", value: 90, color: "hsl(var(--chart-5))" },
    ],
    config: {
      Productive: { label: "Productive", color: "hsl(var(--chart-1))" },
      Unproductive: { label: "Unproductive", color: "hsl(var(--chart-2))" },
      Neutral: { label: "Neutral", color: "hsl(var(--chart-3))" },
      Idle: { label: "Idle", color: "hsl(var(--chart-4))" },
      Other: { label: "Other", color: "hsl(var(--chart-5))" },
    } satisfies ChartConfig,
  },
  hourlyProductivity: {
    points: [
      { name: "09:00", productive: 45, unproductive: 15 },
      { name: "10:00", productive: 60, unproductive: 20 },
      { name: "11:00", productive: 30, unproductive: 30 },
      { name: "12:00", productive: 15, unproductive: 45 },
      { name: "13:00", productive: 20, unproductive: 40 },
      { name: "14:00", productive: 55, unproductive: 25 },
      { name: "15:00", productive: 40, unproductive: 20 },
      { name: "16:00", productive: 35, unproductive: 25 },
      { name: "17:00", productive: 25, unproductive: 35 },
    ],
    config: {
      productive: { label: "Productive", color: "hsl(var(--chart-1))" },
      unproductive: { label: "Unproductive", color: "hsl(var(--chart-2))" },
    } satisfies ChartConfig,
  },
  contextSwitchTrend: {
    points: [
      { name: "09:00", switches: 3 },
      { name: "10:00", switches: 7 },
      { name: "11:00", switches: 5 },
      { name: "12:00", switches: 2 },
      { name: "13:00", switches: 1 },
      { name: "14:00", switches: 8 },
      { name: "15:00", switches: 4 },
      { name: "16:00", switches: 6 },
      { name: "17:00", switches: 3 },
    ],
    config: {
      switches: { label: "Switches", color: "hsl(var(--chart-1))" },
    } satisfies ChartConfig,
  },
  weeklyProductivity: {
    points: [
      { name: "Mon", productivity: 85 },
      { name: "Tue", productivity: 92 },
      { name: "Wed", productivity: 78 },
      { name: "Thu", productivity: 88 },
      { name: "Fri", productivity: 95 },
    ],
    config: {
      productivity: { label: "Productivity", color: "hsl(var(--chart-2))" },
    } satisfies ChartConfig,
  },
}

const focusConfig: FocusData = {
  sessions: [
    { id: "1", start: "09:00", end: "11:15", durationSec: 8100, app: "VS Code", window: "project/src/", productivity: "productive" },
    { id: "2", start: "13:00", end: "14:30", durationSec: 5400, app: "Figma", window: "Design System", productivity: "productive" },
    { id: "3", start: "15:00", end: "16:45", durationSec: 6300, app: "VS Code", window: "project/tests/", productivity: "productive" },
  ],
  categoryMinutes: {
    points: [
      { name: "Development", minutes: 186 },
      { name: "Design", minutes: 285 },
      { name: "Communication", minutes: 237 },
      { name: "Research", minutes: 203 },
      { name: "Meetings", minutes: 209 },
      { name: "Other", minutes: 264 },
    ],
    config: {
      minutes: { label: "Focus Time (minutes)", color: "hsl(var(--chart-1))" },
    } satisfies ChartConfig,
  },
  sessionDistribution: {
    points: [
      { name: "0-15m", sessions: 2 },
      { name: "15-30m", sessions: 5 },
      { name: "30-45m", sessions: 8 },
      { name: "45-60m", sessions: 12 },
      { name: "60-90m", sessions: 6 },
      { name: "90m+", sessions: 3 },
    ],
    config: {
      sessions: { label: "Sessions", color: "hsl(var(--chart-1))" },
    } satisfies ChartConfig,
  },
  focusScoreTrend: {
    points: [
      { name: "09:00", focus: 85 },
      { name: "10:00", focus: 92 },
      { name: "11:00", focus: 78 },
      { name: "12:00", focus: 45 },
      { name: "13:00", focus: 88 },
      { name: "14:00", focus: 95 },
      { name: "15:00", focus: 82 },
      { name: "16:00", focus: 76 },
      { name: "17:00", focus: 68 },
    ],
    config: {
      focus: { label: "Focus Score", color: "hsl(var(--chart-2))" },
    } satisfies ChartConfig,
  },
  goalMinutes: 180,
}

const idleConfig: IdleData = {
  idleOverTime: {
    points: [
      { name: "09:00", idleMin: 0 },
      { name: "09:30", idleMin: 0 },
      { name: "10:00", idleMin: 5 },
      { name: "10:30", idleMin: 0 },
      { name: "11:00", idleMin: 0 },
      { name: "11:30", idleMin: 0 },
      { name: "12:00", idleMin: 30 },
      { name: "12:30", idleMin: 30 },
      { name: "13:00", idleMin: 0 },
      { name: "13:30", idleMin: 0 },
      { name: "14:00", idleMin: 0 },
      { name: "14:30", idleMin: 0 },
      { name: "15:00", idleMin: 0 },
      { name: "15:30", idleMin: 0 },
      { name: "16:00", idleMin: 0 },
      { name: "16:30", idleMin: 0 },
      { name: "17:00", idleMin: 0 },
    ],
    config: {
      idleMin: { label: "Idle Time (minutes)", color: "hsl(var(--chart-1))" },
    } satisfies ChartConfig,
  },
  longBreaks: [
    { start: "12:00", end: "12:30", durationMin: 30, reason: "Lunch break" },
    { start: "15:15", end: "15:20", durationMin: 5, reason: "Coffee break" },
    { start: "16:45", end: "16:50", durationMin: 5, reason: "Stretch break" },
  ],
  trackedMinutes: 480,
}

const appsConfig: AppsData = {
  usageByApp: {
    points: [
      { name: "VS Code", time: 186, productivity: 85 },
      { name: "Chrome", time: 142, productivity: 45 },
      { name: "Figma", time: 98, productivity: 92 },
      { name: "Slack", time: 67, productivity: 30 },
      { name: "Terminal", time: 54, productivity: 88 },
    ],
    config: {
      time: { label: "Time (minutes)", color: "hsl(var(--chart-1))" },
      productivity: { label: "Productivity", color: "hsl(var(--chart-2))" },
    } satisfies ChartConfig,
  },
  categoryDistribution: {
    slices: [
      { name: "Development", value: 45, color: "hsl(var(--chart-1))" },
      { name: "Design", value: 25, color: "hsl(var(--chart-2))" },
      { name: "Communication", value: 15, color: "hsl(var(--chart-3))" },
      { name: "Research", value: 10, color: "hsl(var(--chart-4))" },
      { name: "Other", value: 5, color: "hsl(var(--chart-5))" },
    ],
    config: {
      Development: { label: "Development", color: "hsl(var(--chart-1))" },
      Design: { label: "Design", color: "hsl(var(--chart-2))" },
      Communication: { label: "Communication", color: "hsl(var(--chart-3))" },
      Research: { label: "Research", color: "hsl(var(--chart-4))" },
      Other: { label: "Other", color: "hsl(var(--chart-5))" },
    } satisfies ChartConfig,
  },
  productiveVsUnproductive: {
    points: [
      { name: "VS Code", productive: 186, unproductive: 45 },
      { name: "Chrome", productive: 67, unproductive: 142 },
      { name: "Figma", productive: 98, unproductive: 12 },
      { name: "Slack", productive: 23, unproductive: 67 },
      { name: "Terminal", productive: 54, unproductive: 8 },
    ],
    config: {
      productive: { label: "Productive", color: "hsl(var(--chart-1))" },
      unproductive: { label: "Unproductive", color: "hsl(var(--chart-2))" },
    } satisfies ChartConfig,
  },
  sessions: [
    { app: "VS Code", domain: null, totalTime: 240, sessions: 8, avgSession: 30, productivity: 75 },
    { app: "Chrome", domain: "github.com", totalTime: 90, sessions: 12, avgSession: 7.5, productivity: 67 },
    { app: "Chrome", domain: "stackoverflow.com", totalTime: 60, sessions: 8, avgSession: 7.5, productivity: 83 },
    { app: "Figma", domain: "figma.com", totalTime: 120, sessions: 3, avgSession: 40, productivity: 75 },
    { app: "Slack", domain: "slack.com", totalTime: 90, sessions: 15, avgSession: 6, productivity: 33 },
  ],
}

const switchesConfig: SwitchesData = {
  switchesOverTime: {
    points: overviewConfig.contextSwitchTrend.points,
    config: overviewConfig.contextSwitchTrend.config,
  },
  switchIntensity: {
    points: [
      { name: "0-5", count: 2 },
      { name: "5-10", count: 5 },
      { name: "10-15", count: 8 },
      { name: "15-20", count: 12 },
      { name: "20-25", count: 6 },
      { name: "25+", count: 3 },
    ],
    config: {
      count: { label: "Sessions", color: "hsl(var(--chart-2))" },
    } satisfies ChartConfig,
  },
  topPairs: [
    { from: "VS Code", to: "Chrome", count: 12 },
    { from: "Chrome", to: "VS Code", count: 10 },
    { from: "VS Code", to: "Terminal", count: 8 },
    { from: "Slack", to: "VS Code", count: 6 },
    { from: "Figma", to: "VS Code", count: 5 },
    { from: "Chrome", to: "Slack", count: 4 },
    { from: "Terminal", to: "VS Code", count: 4 },
    { from: "VS Code", to: "Slack", count: 3 },
  ],
}

const timelineConfig: TimelineData = {
  dailyTimeline: {
    points: [
      { name: "6a", "VS Code": 0, Chrome: 0, Figma: 0, Slack: 0, Terminal: 0, System: 0 },
      { name: "7a", "VS Code": 5, Chrome: 3, Figma: 0, Slack: 0, Terminal: 0, System: 2 },
      { name: "8a", "VS Code": 12, Chrome: 6, Figma: 0, Slack: 0, Terminal: 0, System: 0 },
      { name: "9a", "VS Code": 18, Chrome: 8, Figma: 2, Slack: 2, Terminal: 0, System: 0 },
      { name: "10a", "VS Code": 22, Chrome: 10, Figma: 4, Slack: 2, Terminal: 0, System: 0 },
      { name: "11a", "VS Code": 25, Chrome: 8, Figma: 3, Slack: 4, Terminal: 0, System: 0 },
      { name: "12p", "VS Code": 8, Chrome: 4, Figma: 0, Slack: 2, Terminal: 0, System: 20 },
      { name: "1p", "VS Code": 28, Chrome: 12, Figma: 6, Slack: 2, Terminal: 0, System: 0 },
      { name: "2p", "VS Code": 24, Chrome: 10, Figma: 8, Slack: 4, Terminal: 0, System: 0 },
      { name: "3p", "VS Code": 20, Chrome: 8, Figma: 4, Slack: 6, Terminal: 0, System: 0 },
      { name: "4p", "VS Code": 16, Chrome: 6, Figma: 2, Slack: 4, Terminal: 0, System: 0 },
      { name: "5p", "VS Code": 12, Chrome: 4, Figma: 0, Slack: 2, Terminal: 0, System: 0 },
      { name: "6p", "VS Code": 8, Chrome: 4, Figma: 0, Slack: 0, Terminal: 0, System: 0 },
      { name: "7p", "VS Code": 4, Chrome: 2, Figma: 0, Slack: 0, Terminal: 0, System: 0 },
      { name: "8p", "VS Code": 0, Chrome: 0, Figma: 0, Slack: 0, Terminal: 0, System: 0 },
    ],
    config: {
      "VS Code": { label: "VS Code", color: "hsl(var(--chart-1))" },
      Chrome: { label: "Chrome", color: "hsl(var(--chart-2))" },
      Figma: { label: "Figma", color: "hsl(var(--chart-3))" },
      Slack: { label: "Slack", color: "hsl(var(--chart-4))" },
      Terminal: { label: "Terminal", color: "hsl(var(--chart-5))" },
      System: { label: "System", color: "hsl(var(--chart-6))" },
    } satisfies ChartConfig,
  },
  activityEvents: [
    {
      ts: "2024-01-15T09:00:00Z",
      app: "VS Code",
      window: "project/src/App.tsx",
      domain: null,
      idleSec: 0,
      category: "Development",
      productivity: "productive",
    },
    {
      ts: "2024-01-15T09:15:00Z",
      app: "Chrome",
      window: "GitHub - project",
      domain: "github.com",
      idleSec: 0,
      category: "Development",
      productivity: "productive",
    },
    {
      ts: "2024-01-15T09:30:00Z",
      app: "Slack",
      window: "Team Chat",
      domain: "slack.com",
      idleSec: 0,
      category: "Communication",
      productivity: "neutral",
    },
    {
      ts: "2024-01-15T10:00:00Z",
      app: "VS Code",
      window: "project/src/components/",
      domain: null,
      idleSec: 0,
      category: "Development",
      productivity: "productive",
    },
    {
      ts: "2024-01-15T10:30:00Z",
      app: "Chrome",
      window: "Stack Overflow",
      domain: "stackoverflow.com",
      idleSec: 0,
      category: "Development",
      productivity: "productive",
    },
    {
      ts: "2024-01-15T11:00:00Z",
      app: "Twitter",
      window: "Home / X",
      domain: "twitter.com",
      idleSec: 0,
      category: "Social",
      productivity: "unproductive",
    },
    {
      ts: "2024-01-15T11:15:00Z",
      app: "VS Code",
      window: "project/",
      domain: null,
      idleSec: 0,
      category: "Development",
      productivity: "productive",
    },
    {
      ts: "2024-01-15T12:00:00Z",
      app: "System",
      window: "Lunch Break",
      domain: null,
      idleSec: 1800,
      category: "Break",
      productivity: "idle",
    },
  ],
}

const settingsConfig: SettingsData = {
  thresholds: {
    sessionSeconds: 30,
    idleSeconds: 300,
    breakMinutes: 15,
  },
  rules: [
    {
      id: "rule-vscode",
      label: "VS Code",
      resource: "VS Code",
      resourceType: "application",
      productivity: "productive",
    },
    {
      id: "rule-github",
      label: "github.com",
      resource: "github.com",
      resourceType: "domain",
      productivity: "productive",
    },
    {
      id: "rule-twitter",
      label: "twitter.com",
      resource: "twitter.com",
      resourceType: "domain",
      productivity: "unproductive",
    },
  ],
  privacy: {
    redactFilenames: true,
    hideScreenshots: false,
    anonymizeDomains: false,
  },
  dataManagement: {
    retentionDays: 90,
    exportLabel: "Download your productivity data",
    deleteLabel: "Permanently remove all tracked data",
  },
  monitorStatus: {
    unproductive_streak: false,
    checked_at: new Date().toISOString(),
  },
}

export const dashboardMockData: DashboardData = {
  overview: overviewConfig,
  focus: focusConfig,
  idle: idleConfig,
  apps: appsConfig,
  switches: switchesConfig,
  timeline: timelineConfig,
  settings: settingsConfig,
}
