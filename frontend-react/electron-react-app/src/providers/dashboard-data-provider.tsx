import { createContext, useContext, useMemo, type ReactNode } from "react"
import {
  dashboardMockData,
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

export function DashboardDataProvider({ value = dashboardMockData, children }: DashboardDataProviderProps) {
  const memoizedValue = useMemo(() => value, [value])

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
