# Backend Integration Guide

This app is now refactored to be backend‑ready. All hard‑coded values used by active pages are centralized behind a typed provider so you can swap in live API responses without touching page UIs or Shadcn components.

## Data Flow Overview

- `src/providers/dashboard-data-provider.tsx` exposes a `DashboardDataProvider` context.
- Pages read typed slices via hooks: `useOverviewData`, `useFocusData`, `useIdleData`, `useAppsData`, `useSwitchesData`, `useTimelineData`, `useSettingsData`.
- Mock data and TypeScript contracts live in `src/data/dashboard.ts`.
- Charts consume only two props: `data` (array of points) and `config` (ChartConfig with colors/labels). No UI code changes are needed when switching to real data.

## Contracts (Types)

- Central types in `src/data/dashboard.ts`:
  - `DashboardData` → root payload
  - Per‑page types: `OverviewData`, `FocusData`, `IdleData`, `AppsData`, `SwitchesData`, `TimelineData`, `SettingsData`
  - Utility types: `NamedMetricPoint<TFields>`, `DonutSlice`

Key shapes used by charts:

- Line/Bar series: `Array<{ name: string } & Record<MetricName, number>>`
- Donut/pie: `Array<{ name: string; value: number; color?: string }>`
- Each series also has a `ChartConfig` with color tokens, e.g. `{ switches: { label: "Switches", color: "hsl(var(--chart-1))" } }`

## Provider Usage

App wiring (current):

```tsx
// src/App.tsx
<NavigationProvider>
  <DashboardDataProvider>
    <DashboardShell>
      <Router />
    </DashboardShell>
  </DashboardDataProvider>
</NavigationProvider>
```

Pages consume the provider (example):

```tsx
// src/pages/idle.tsx
const { idleOverTime, longBreaks, trackedMinutes } = useIdleData()
```

## Swapping to Live Backend

You have two non‑breaking options. Choose one per your architecture.

1) Inject real data from the app root

- Fetch the full `DashboardData` on startup and pass it via the provider `value` prop.

```tsx
// src/App.tsx (example sketch)
import { useEffect, useState } from "react"
import { DashboardDataProvider } from "providers/dashboard-data-provider"
import type { DashboardData } from "data/dashboard"

function App() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    ;(async () => {
      const res = await fetch("/api/dashboard")
      const json = (await res.json()) as DashboardData
      setData(json)
    })()
  }, [])

  return (
    <NavigationProvider>
      <DashboardDataProvider value={data ?? dashboardMockData}>
        <DashboardShell>
          <Router />
        </DashboardShell>
      </DashboardDataProvider>
    </NavigationProvider>
  )
}
```

2) Load inside the provider (React Query/SWR)

- Replace `dashboardMockData` with a query that resolves to the same `DashboardData` type. The provider remains the only place that knows where data comes from.

```tsx
// src/providers/dashboard-data-provider.tsx (sketch)
import { useQuery } from "@tanstack/react-query"

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await fetch("/api/dashboard")).json(),
  })

  return (
    <DashboardDataContext.Provider value={data ?? dashboardMockData}>
      {children}
    </DashboardDataContext.Provider>
  )
}
```

## Mapping From Raw API → UI Schemas

Keep an adapter layer so the UI never depends on backend field names.

```ts
// src/services/adapters/dashboard-adapter.ts
import type { DashboardData } from "data/dashboard"

export function toDashboardData(api: any): DashboardData {
  // Map API shapes into NamedMetricPoint/DonutSlice + ChartConfig
  return {
    overview: {
      productivityBreakdown: {
        slices: api.overview.breakdown.map((s: any) => ({ name: s.label, value: s.value, color: s.color })),
        config: { productive: { label: "Productive", color: "hsl(var(--chart-1))" }, /* ... */ },
      },
      hourlyProductivity: { points: api.overview.hourly, config: {/* ... */} },
      contextSwitchTrend: { points: api.switches.trend, config: {/* ... */} },
      weeklyProductivity: { points: api.overview.weekly, config: {/* ... */} },
    },
    // ... map other sections
  }
}
```

## Validation (Recommended)

Use Zod to validate inputs at the boundary to prevent UI crashes.

```ts
// src/services/schemas/dashboard.ts
import { z } from "zod"

export const donutSlice = z.object({ name: z.string(), value: z.number(), color: z.string().optional() })
export const namedPoint = (fields: string[]) => z.object({ name: z.string(), ...Object.fromEntries(fields.map(f => [f, z.number()])) })

export const overviewSchema = z.object({
  productivityBreakdown: z.object({ slices: z.array(donutSlice) }),
})
```

Place validation in your adapter before returning `DashboardData`.

## Chart Contracts

- ChartLine/ChartBar expect: `data=[{ name, metric1, metric2...}]` and `config={ metric1:{label,color}, ... }`.
- ChartDonut expects: `data=[{ name, value, color? }]` and a config whose keys match legend/tooltip labeling.
- Colors should use Shadcn tokens, e.g. `"hsl(var(--chart-1))"` to preserve theming.

## Electron Notes

- If pulling from a local process, expose an IPC endpoint that returns the same `DashboardData` shape and hydrate via the provider.
- Keep network/IPC code out of components; only the provider/adapters should know about it.

## Migration Checklist

- [x] Inline mocks removed from active pages.
- [x] Shared data contracts defined and used.
- [x] Charts render only via `data` + `config` props.
- [ ] Implement API client and adapters.
- [ ] Add validation and error boundaries.
- [ ] Switch provider to live data.

## Troubleshooting

- Empty arrays/zero values are fine; derived metrics guard against division by zero.
- When adding new series, update `ChartConfig` in the same section and reuse existing color tokens.

