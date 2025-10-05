import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  dashboardMockData,
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
  const [data, setData] = useState<DashboardData>(value ?? dashboardMockData)

  useEffect(() => {
    if (value) {
      setData(value)
      return
    }

    let isMounted = true
    const controller = new AbortController()

    async function hydrateFromBackend() {
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/`, {
          signal: controller.signal,
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error(`Dashboard fetch failed with status ${response.status}`)
        }
        const payload = await response.json()
        const incoming = payload?.data as PartialDashboardData | undefined
        if (incoming && isMounted) {
          setData((prev) => mergeDashboard(prev, incoming))
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return
        }
        console.warn("Failed to hydrate dashboard data", error)
      }
    }

    hydrateFromBackend()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [value])

  const memoizedValue = useMemo(() => data, [data])

  return (
    <DashboardDataContext.Provider value={memoizedValue}>
      {children}
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
