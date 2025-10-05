import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  type PartialDashboardData,
  type DashboardData,
  type OverviewData,
  type FocusData,
  type IdleData,
  type AppsData,
  type SwitchesData,
  type TimelineData,
  type SettingsData,
} from "data/dashboard"

const DashboardDataContext = createContext<DashboardData | null>(null)
type DashboardActions = {
  refresh: () => Promise<void>
  isRefreshing: boolean
}
const DashboardActionsContext = createContext<DashboardActions | null>(null)

type DashboardDataProviderProps = {
  value?: DashboardData
  children: ReactNode
}

const API_BASE = (process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "")

function mergeDashboard(base: DashboardData, incoming: PartialDashboardData): DashboardData {
  return {
    ...base,
    overview: incoming.overview ?? base.overview,
    focus: incoming.focus ?? base.focus,
    idle: incoming.idle ?? base.idle,
    apps: incoming.apps ?? base.apps,
    switches: incoming.switches ?? base.switches,
    timeline: incoming.timeline ?? base.timeline,
    settings: {
      ...base.settings,
      ...incoming.settings,
    },
  }
}

export function DashboardDataProvider({ value, children }: DashboardDataProviderProps) {
  // Seed from last good payload to avoid reverting to mocks on remount
  const persistedRaw = typeof window !== "undefined" ? sessionStorage.getItem("dashboardData") : null
  const persisted: DashboardData | null = persistedRaw ? (() => {
    try {
      return JSON.parse(persistedRaw)
    } catch {
      return null
    }
  })() : null

  function makeEmpty(): DashboardData {
    return {
      overview: {
        productivityBreakdown: { slices: [], config: {} as any },
        hourlyProductivity: { points: [], config: {} as any },
        contextSwitchTrend: { points: [], config: {} as any },
        weeklyProductivity: { points: [], config: {} as any },
      },
      focus: {
        sessions: [],
        categoryMinutes: { points: [], config: {} as any },
        sessionDistribution: { points: [], config: {} as any },
        focusScoreTrend: { points: [], config: {} as any },
        goalMinutes: 0,
      },
      idle: {
        idleOverTime: { points: [], config: {} as any },
        longBreaks: [],
        trackedMinutes: 0,
      },
      apps: {
        usageByApp: { points: [], config: {} as any },
        categoryDistribution: { slices: [], config: {} as any },
        productiveVsUnproductive: { points: [], config: {} as any },
        sessions: [],
      },
      switches: {
        switchesOverTime: { points: [], config: {} as any },
        switchIntensity: { points: [], config: {} as any },
        topPairs: [],
      },
      timeline: {
        dailyTimeline: { points: [], config: {} as any },
        activityEvents: [],
      },
      settings: {
        thresholds: { sessionSeconds: 0, idleSeconds: 0, breakMinutes: 0 },
        rules: [],
        privacy: { redactFilenames: false, hideScreenshots: false, anonymizeDomains: false },
        dataManagement: { retentionDays: 0, exportLabel: "", deleteLabel: "" },
        monitorStatus: undefined,
      },
    }
  }

  const [data, setData] = useState<DashboardData>(value ?? persisted ?? makeEmpty())
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(() => {
    if (!persistedRaw) return null
    try {
      const meta = sessionStorage.getItem("dashboardGeneratedAt")
      return meta ?? null
    } catch {
      return null
    }
  })
  const lastGeneratedAtRef = useRef<string | null>(lastGeneratedAt)
  useEffect(() => { lastGeneratedAtRef.current = lastGeneratedAt }, [lastGeneratedAt])

  async function fetchDashboard(signal?: AbortSignal) {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/?t=${Date.now()}` , {
        signal,
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      if (!response.ok) {
        throw new Error(`Dashboard fetch failed with status ${response.status}`)
      }
      const payload = await response.json()
      const generatedAt: string | undefined = payload?.generated_at
      const incoming = payload?.data as PartialDashboardData | undefined
      if (incoming) {
        setData((prev) => {
          // Ignore stale responses if we already have a newer snapshot
          const currentGen = lastGeneratedAtRef.current || undefined
          if (generatedAt && currentGen) {
            try {
              const prevTs = Date.parse(currentGen)
              const nextTs = Date.parse(generatedAt)
              if (!Number.isNaN(prevTs) && !Number.isNaN(nextTs) && nextTs <= prevTs) {
                return prev
              }
            } catch {}
          }

          const merged = mergeDashboard(prev, incoming)
          try {
            sessionStorage.setItem("dashboardData", JSON.stringify(merged))
            if (generatedAt) sessionStorage.setItem("dashboardGeneratedAt", generatedAt)
          } catch {}
          if (generatedAt) setLastGeneratedAt(generatedAt)
          return merged
        })
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      console.warn("Failed to hydrate dashboard data", error)
    }
  }

  useEffect(() => {
    if (value) {
      // External value provided: trust it and persist
      setData(value)
      try {
        sessionStorage.setItem("dashboardData", JSON.stringify(value))
      } catch {}
      return
    }

    const controller = new AbortController()
    fetchDashboard(controller.signal)

    // Real-time polling: keep data fresh; abort on unmount
    const interval = window.setInterval(() => {
      const c = new AbortController()
      fetchDashboard(c.signal)
    }, 10000)

    return () => {
      controller.abort()
      window.clearInterval(interval)
    }
  }, [value])

  const refresh = async () => {
    if (value) return
    setIsRefreshing(true)
    const controller = new AbortController()
    try {
      await fetchDashboard(controller.signal)
    } finally {
      setIsRefreshing(false)
    }
  }

  const memoizedValue = useMemo(() => data, [data])

  return (
    <DashboardDataContext.Provider value={memoizedValue}>
      <DashboardActionsContext.Provider value={{ refresh, isRefreshing }}>
        {children}
      </DashboardActionsContext.Provider>
    </DashboardDataContext.Provider>
  )
}

function useDashboardDataContext() {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider")
  }
  return context
}

export function useDashboardData(): DashboardData {
  return useDashboardDataContext()
}

export function useOverviewData(): OverviewData {
  return useDashboardDataContext().overview
}

export function useFocusData(): FocusData {
  return useDashboardDataContext().focus
}

export function useIdleData(): IdleData {
  return useDashboardDataContext().idle
}

export function useAppsData(): AppsData {
  return useDashboardDataContext().apps
}

export function useSwitchesData(): SwitchesData {
  return useDashboardDataContext().switches
}

export function useTimelineData(): TimelineData {
  return useDashboardDataContext().timeline
}

export function useSettingsData(): SettingsData {
  return useDashboardDataContext().settings
}

export function useDashboardActions(): DashboardActions {
  const ctx = useContext(DashboardActionsContext)
  if (!ctx) {
    throw new Error("useDashboardActions must be used within a DashboardDataProvider")
  }
  return ctx
}
