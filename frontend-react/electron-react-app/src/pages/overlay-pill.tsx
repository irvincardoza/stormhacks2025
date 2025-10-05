import React, { useEffect, useLayoutEffect, useRef, useState } from "react"

export function OverlayPill() {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pillRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 20 })
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Autofocus and select on show without timers to avoid races
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // Center horizontally after initial layout
  useLayoutEffect(() => {
    const el = pillRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const margin = 12
    const centeredX = Math.max(margin, Math.round((window.innerWidth - rect.width) / 2))
    setPosition({ x: centeredX, y: 20 })
  }, [])

  const clampWithinViewport = (x: number, y: number) => {
    const el = pillRef.current
    const margin = 12
    const width = el?.offsetWidth ?? 0
    const height = el?.offsetHeight ?? 0
    const maxX = Math.max(margin, window.innerWidth - width - margin)
    const maxY = Math.max(margin, window.innerHeight - height - margin)
    return {
      x: Math.min(Math.max(x, margin), maxX),
      y: Math.min(Math.max(y, margin), maxY),
    }
  }

  const onDragMove = (e: PointerEvent) => {
    const offset = dragOffsetRef.current
    const el = pillRef.current
    if (!offset || !el) return
    const next = clampWithinViewport(e.clientX - offset.x, e.clientY - offset.y)
    setPosition(next)
  }

  const endDrag = () => {
    setIsDragging(false)
    dragOffsetRef.current = null
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
  }

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const el = pillRef.current
    if (!el) return
    e.preventDefault()
    const rect = el.getBoundingClientRect()
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setIsDragging(true)
    try { (e.currentTarget as any)?.setPointerCapture?.(e.pointerId) } catch {}
    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onDragMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Placeholder submit behavior; extend as needed
      // For now, just clear and let main hide on blur or shortcut
      setValue("")
      // Attempt to blur to trigger main-driven hide
      inputRef.current?.blur()
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div
        ref={pillRef}
        className={`pointer-events-auto w-[720px] max-w-[90vw] rounded-full border bg-black/80 border-white/25 backdrop-blur-xl shadow-2xl px-4 py-3 flex items-center gap-3 ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ WebkitAppRegion: 'no-drag', position: 'absolute', top: position.y, left: position.x } as React.CSSProperties}
      >
        {/* drag handle */}
        <div
          className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} flex-none h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors select-none`}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          aria-label="Move pill"
          title="Drag to move"
          onPointerDown={onDragStart}
        />
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-white placeholder-white/80 px-1 text-lg md:text-xl leading-7"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          placeholder="Type to search or ask…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="text-sm md:text-base text-white/80 select-none pr-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>Enter</div>
      </div>
    </div>
  )
}

export default OverlayPill
