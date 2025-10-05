// Utilities for recognizing and clamping time-of-day X-axes to a fixed window.
// DRY helper used by multiple chart components. No side effects.

export type TimeWindow = {
  start: string // e.g., "08:00" or "8a"
  end: string // e.g., "13:00" or "1p"
  nameKey?: string // default: "name"
}

// Return minutes since midnight for supported time label formats.
// Supports: "HH:MM" (24h), "H:MM" (24h), and compact 12h forms like "6a", "10a", "12p", "1p".
export function parseTimeLabelToMinutes(raw: string): number | null {
  if (!raw) return null
  const s = String(raw).trim().toLowerCase()

  // 24-hour HH:MM or H:MM
  const m24 = s.match(/^([0-9]{1,2}):([0-9]{2})$/)
  if (m24) {
    const h = Number(m24[1])
    const m = Number(m24[2])
    if (Number.isFinite(h) && Number.isFinite(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
      return h * 60 + m
    }
  }

  // Compact 12-hour forms: "6a", "10a", "12p", "1p"
  const m12 = s.match(/^([0-9]{1,2})(a|p)$/)
  if (m12) {
    let h = Number(m12[1])
    const mer = m12[2]
    if (!Number.isFinite(h) || h < 1 || h > 12) return null
    if (mer === 'a') {
      if (h === 12) h = 0
    } else {
      if (h !== 12) h += 12
    }
    return h * 60
  }

  return null
}

export function isTimeLabel(raw: string | unknown): boolean {
  if (typeof raw !== 'string') return false
  return parseTimeLabelToMinutes(raw) !== null
}

// Convert a human label to minutes; supports same forms as above.
function labelToMinutes(label: string): number | null {
  return parseTimeLabelToMinutes(label)
}

function clampRangeMinutes(startLabel: string, endLabel: string): [number, number] | null {
  const s = labelToMinutes(startLabel)
  const e = labelToMinutes(endLabel)
  if (s === null || e === null) return null
  return s <= e ? [s, e] : [e, s]
}

// Filter data rows to entries with `nameKey` within [start, end] (inclusive),
// but only when their labels look like time-of-day.
export function filterToTimeWindow<T extends Record<string, any>>(
  data: T[],
  opts: TimeWindow = { start: '08:00', end: '13:00', nameKey: 'name' }
): T[] {
  const nameKey = opts.nameKey ?? 'name'
  if (!Array.isArray(data) || data.length === 0) return data

  // If first data row does not look like time-of-day, do nothing to avoid clobbering non-time charts.
  const first = data[0]?.[nameKey]
  if (!isTimeLabel(first)) return data

  const range = clampRangeMinutes(opts.start, opts.end)
  if (!range) return data
  const [startMin, endMin] = range

  return data.filter((row) => {
    const label = row?.[nameKey]
    const mins = typeof label === 'string' ? parseTimeLabelToMinutes(label) : null
    if (mins === null) return false
    return mins >= startMin && mins <= endMin
  })
}

