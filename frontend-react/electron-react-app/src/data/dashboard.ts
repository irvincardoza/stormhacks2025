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
