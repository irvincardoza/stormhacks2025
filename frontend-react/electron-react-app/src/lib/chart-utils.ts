// Chart data helpers shared across pages/components.

import type { ChartConfig } from "components/ui/chart"

// Normalize stacked values per row so they sum to 100.
export function normalizeStackToPercent<T extends Record<string, any>>(
  points: T[],
  config: ChartConfig
): T[] {
  if (!Array.isArray(points) || points.length === 0) return points
  const keys = Object.keys(config)
  if (!keys.length) return points

  return points.map((p) => {
    const total = keys.reduce((sum, k) => sum + (Number((p as any)[k]) || 0), 0)
    if (!total) return p
    const normalized: Record<string, number> = {}
    for (const k of keys) {
      const raw = Number((p as any)[k]) || 0
      normalized[k] = (raw / total) * 100
    }
    return { ...p, ...normalized }
  })
}

