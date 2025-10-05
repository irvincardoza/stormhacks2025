import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { assistWithScreenshot, type OverlayAssistResponse } from "services/overlay-analyze"

type PromptTemplate = {
  system: string
  guidelines: string[]
  response: string
  userQuery: string
}

export function OverlayPill() {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OverlayAssistResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null)
  const [, setPromptLoaded] = useState<boolean>(false)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState<string>("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pillRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 20 })
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [resultBoxStyle, setResultBoxStyle] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 })

  useEffect(() => {
    // Autofocus and select on show without timers to avoid races
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // Load external XML prompt once
  useEffect(() => {
    let cancelled = false
    const urlCandidates = [
      // relative works for CRA dev and file:// packaged builds
      'prompts/overlay_assist.xml',
      // absolute as fallback in dev server
      '/prompts/overlay_assist.xml',
    ]
    const tryFetch = async () => {
      let lastErr: Error | null = null
      for (const url of urlCandidates) {
        try {
          const resp = await fetch(url)
          if (!resp.ok) continue
          const text = await resp.text()
          if (cancelled) return

          if (typeof DOMParser === 'undefined') {
            if (!cancelled) {
              setPromptTemplate(null)
              setTemplateError('DOMParser unavailable; using fallback prompt')
              setPromptLoaded(true)
            }
            return
          }

          const parser = new DOMParser()
          const doc = parser.parseFromString(text, 'application/xml')
          if (doc.querySelector('parsererror')) {
            throw new Error('Failed to parse overlay prompt XML')
          }

          const template: PromptTemplate = {
            system: doc.querySelector('system')?.textContent?.trim() ?? '',
            guidelines: Array.from(doc.querySelectorAll('guidelines > item'))
              .map((node) => node.textContent?.trim() ?? '')
              .filter((line) => line.length > 0),
            response: doc.querySelector('response')?.textContent?.trim() ?? '',
            userQuery: doc.querySelector('placeholders > user_query')?.textContent?.trim() ?? 'User question: {{USER_QUERY}}',
          }

          if (!cancelled) {
            setPromptTemplate(template)
            setTemplateError(null)
            setPromptLoaded(true)
          }
          return
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error('Failed to load overlay prompt')
        }
      }
      if (!cancelled) {
        setPromptTemplate(null)
        setTemplateError(lastErr?.message || 'Prompt template unavailable')
        setPromptLoaded(true)
      }
    }
    tryFetch()
    return () => { cancelled = true }
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

  // Keep result box positioned under the pill
  useEffect(() => {
    const el = pillRef.current
    if (!el) return
    const width = el.offsetWidth
    const height = el.offsetHeight
    setResultBoxStyle({ left: position.x, top: position.y + height + 8, width })
  }, [position, value, result, error, loading, templateError, lastQuery])

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

  const onDragMove = useCallback((e: PointerEvent) => {
    const offset = dragOffsetRef.current
    const el = pillRef.current
    if (!offset || !el) return
    const next = clampWithinViewport(e.clientX - offset.x, e.clientY - offset.y)
    setPosition(next)
  }, [])

  const endDrag = useCallback(() => {
    setIsDragging(false)
    dragOffsetRef.current = null
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
  }, [onDragMove])

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
  }, [onDragMove, endDrag])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (!loading) {
        submit()
      }
      return
    }
    if (e.key === "Enter") {
      // Preserve existing behavior for plain Enter: clear and blur to hide overlay
      setValue("")
      inputRef.current?.blur()
    }
  }

  const submit = async () => {
    const prompt = value.trim()
    if (!prompt) return
    setLoading(true)
    setError(null)
    setResult(null)
    setLastQuery(prompt)
    try {
      let finalPrompt = `You are an on-screen assistant. User question: ${prompt}`
      if (promptTemplate) {
        const sections: string[] = []
        if (promptTemplate.system.trim().length > 0) {
          sections.push(promptTemplate.system.trim())
        }
        if (promptTemplate.guidelines.length > 0) {
          const enumerated = promptTemplate.guidelines
            .map((line, idx) => `${idx + 1}. ${line}`)
            .join('\n')
          sections.push(`Guidelines:\n${enumerated}`)
        }
        if (promptTemplate.response.trim().length > 0) {
          sections.push(`Response expectations:\n${promptTemplate.response.trim()}`)
        }
        const querySection = promptTemplate.userQuery.includes('{{USER_QUERY}}')
          ? promptTemplate.userQuery.replace(/\{\{USER_QUERY\}\}/g, prompt)
          : `${promptTemplate.userQuery}\n${prompt}`
        sections.push(querySection.trim())
        finalPrompt = sections.filter((section) => section.trim().length > 0).join('\n\n')
      }
      const res = await assistWithScreenshot(finalPrompt)
      setResult(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to process overlay assist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Pill */}
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
          placeholder="Ask based on your screen…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="text-sm md:text-base text-white/80 select-none pr-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {loading ? 'Sending…' : 'Enter'}
        </div>
      </div>

      {/* Result panel */}
      {(loading || error || result || templateError) && (
        <div
          className="pointer-events-auto rounded-xl border bg-black/80 border-white/20 backdrop-blur-xl shadow-2xl text-white p-3 text-sm"
          style={{ position: 'absolute', left: resultBoxStyle.left, top: resultBoxStyle.top, width: resultBoxStyle.width }}
        >
          {loading && <div>Analyzing screenshot…</div>}
          {!loading && error && <div className="text-red-300">{error}</div>}
          {!loading && !error && templateError && !result && (
            <div className="text-amber-200">{templateError}</div>
          )}
          {!loading && result && (
            <div className="space-y-2">
              {lastQuery && (
                <div className="space-y-1">
                  <div className="text-white/60 text-[11px] tracking-wide uppercase">You asked</div>
                  <div className="text-white/90 text-sm leading-snug">{lastQuery}</div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-white/60 text-[11px] tracking-wide uppercase">Assistant</div>
                <div className="whitespace-pre-wrap text-base leading-relaxed text-white">{result.reply || 'No answer returned.'}</div>
              </div>
              {result.model && (
                <div className="text-white/40 text-[11px]">Model: {result.model}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OverlayPill
