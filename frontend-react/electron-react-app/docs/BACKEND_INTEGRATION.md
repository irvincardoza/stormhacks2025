# Backend Integration Guide

This app is now refactored to be backend‑ready. All hard‑coded values used by active pages are centralized behind a typed provider so you can swap in live API responses without touching page UIs or Shadcn components.

## Data Flow Overview

- Django exposes `GET /api/dashboard/` which returns a `DashboardData`-compatible payload assembled from `data-backend` metrics.
- `src/providers/dashboard-data-provider.tsx` fetches that endpoint on mount (respecting `REACT_APP_API_BASE`, defaulting to `http://127.0.0.1:8000`).
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

The provider now hydrates itself automatically, so no UI wiring is required. You still have two escape hatches:

1. **Override the source** – pass a `value` prop to `DashboardDataProvider` when you need fixtures (tests/offline) and the fetch logic is skipped.
2. **Point to another host** – set `REACT_APP_API_BASE` (e.g. `http://localhost:8787`) to target a different Django instance when packaging Electron builds.

Anything the backend does not yet emit falls back to the rich mocks in `dashboard.ts`, so incremental rollout is safe.

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
- [x] Implement API client (provider fetch + Django endpoint).
- [ ] Add validation and error boundaries.
- [x] Switch provider to live data.

## Troubleshooting

- Empty arrays/zero values are fine; derived metrics guard against division by zero.
- When adding new series, update `ChartConfig` in the same section and reuse existing color tokens.
