import React from "react"
import ReactDOM from "react-dom/client"

import "./index.css"
import App from "./App"
import OverlayPill from "pages/overlay-pill"
import MicOverlay from "./overlays/mic-overlay"
import { ThemeProvider } from "lib/theme"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

const root = ReactDOM.createRoot(rootElement)

const params = new URLSearchParams(window.location.search)
const view = params.get('view')
const isOverlay = view === 'overlay'
const isMicOverlay = view === 'mic-overlay'
if (isOverlay) {
  document.documentElement.setAttribute('data-overlay', '1')
} else if (isMicOverlay) {
  document.documentElement.setAttribute('data-mic-overlay', '1')
}

root.render(
  <React.StrictMode>
    <ThemeProvider>
      {isOverlay ? <OverlayPill /> : isMicOverlay ? <MicOverlay /> : <App />}
    </ThemeProvider>
  </React.StrictMode>
)
