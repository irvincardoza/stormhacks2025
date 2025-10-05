import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  subscribeMicStatus,
  subscribeMicResponse,
  type MicStatus,
  type MicOverlayResult,
} from "services/mic-control"

type Phase = "idle" | "listening" | "processing" | "responded"

const initialStatus: MicStatus = { recording: false }

function pickAssistantReply(payload: MicOverlayResult | null): string {
  if (!payload || typeof payload !== "object") return ""
  const overlay = (payload as any)?.overlay_response
  if (overlay && typeof overlay === "object") {
    const reply = overlay.reply ?? overlay.response
    return reply ? String(reply).trim() : ""
  }
  const fallback = (payload as any)?.reply ?? (payload as any)?.response
  return fallback ? String(fallback).trim() : ""
}

function pickModelLabel(payload: MicOverlayResult | null): string {
  if (!payload || typeof payload !== "object") return ""
  const overlay = (payload as any)?.overlay_response
  if (overlay && typeof overlay === "object" && overlay.model) {
    return String(overlay.model)
  }
  if ((payload as any)?.model) {
    return String((payload as any).model)
  }
  return ""
}

export default function MicOverlay(): React.JSX.Element {
  const [status, setStatus] = useState<MicStatus>(initialStatus)
  const [lastMessage, setLastMessage] = useState<string | undefined>(undefined)
  const [result, setResult] = useState<MicOverlayResult | null>(null)
  const lastRecordingRef = useRef(false)

  useEffect(() => {
    const unsubscribeStatus = subscribeMicStatus((next) => {
      setStatus(next)
      const message = (next.message ?? "").toString().trim()
      setLastMessage(message.length > 0 ? message : undefined)
      if (next.recording && !lastRecordingRef.current) {
        setResult(null)
      }
      lastRecordingRef.current = next.recording
    })

    const unsubscribeResponse = subscribeMicResponse((payload) => {
      setResult(payload)
      setLastMessage(undefined)
    })

    return () => {
      try { unsubscribeStatus() } catch (_) {}
      try { unsubscribeResponse() } catch (_) {}
    }
  }, [])

  const transcript = useMemo(() => {
    if (!result || typeof result !== "object") return ""
    const value = (result as any)?.transcript
    return value ? String(value).trim() : ""
  }, [result])

  const assistantReply = useMemo(() => pickAssistantReply(result), [result])
  const modelLabel = useMemo(() => pickModelLabel(result), [result])

  const phase: Phase = useMemo(() => {
    if (assistantReply.length > 0 || transcript.length > 0) return "responded"
    if (status.recording) return "listening"
    if (lastMessage) return "processing"
    return "idle"
  }, [assistantReply.length, transcript.length, status.recording, lastMessage])

  const heading = useMemo(() => {
    switch (phase) {
      case "listening":
        return "Listening…"
      case "processing":
        return "Processing screenshot…"
      case "responded":
        return "Assistant reply"
      default:
        return "Voice assistant"
    }
  }, [phase])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto w-[440px] max-w-[92vw] rounded-3xl border border-white/20 bg-black/75 backdrop-blur-xl shadow-2xl px-8 py-7 text-white space-y-6">
        <div className="flex flex-col items-center gap-4">
          {phase === "listening" && (
            <div className="relative h-20 w-20">
              <span className="absolute inset-0 rounded-full bg-orange-400/25 animate-ping" />
              <span className="absolute inset-3 rounded-full bg-orange-400" />
            </div>
          )}
          {phase === "processing" && (
            <div className="relative h-16 w-16">
              <span className="absolute inset-0 rounded-full border border-white/30 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="absolute inset-2 rounded-full bg-white/20" />
            </div>
          )}
          {phase === "responded" && (
            <div className="relative h-16 w-16">
              <span className="absolute inset-0 rounded-full bg-emerald-400/25" />
              <span className="absolute inset-2 rounded-full bg-emerald-400/80" />
            </div>
          )}

          <div className="text-xl font-semibold tracking-tight text-white text-center">{heading}</div>
          {phase !== "responded" && lastMessage && (
            <p className="text-sm text-white/60 text-center whitespace-pre-wrap">{lastMessage}</p>
          )}
        </div>

        {phase === "responded" && (
          <div className="space-y-4 text-left">
            {transcript.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[11px] uppercase tracking-wide text-white/50">You said</span>
                <p className="text-base leading-relaxed text-white/90 whitespace-pre-wrap">{transcript}</p>
              </div>
            )}
            <div className="space-y-2">
              <span className="block text-[11px] uppercase tracking-wide text-white/50">Assistant</span>
              <p className="text-lg leading-relaxed whitespace-pre-wrap text-white">{assistantReply || "No answer returned."}</p>
            </div>
            {modelLabel && (
              <div className="text-[11px] text-white/40">Model: {modelLabel}</div>
            )}
          </div>
        )}

        {phase === "processing" && !lastMessage && (
          <p className="text-sm text-white/60 text-center">Processing your screen capture…</p>
        )}
        {phase === "idle" && (
          <p className="text-sm text-white/50 text-center">Waiting for the next push-to-talk session.</p>
        )}
      </div>
    </div>
  )
}
