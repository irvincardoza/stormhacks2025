import React from "react"
import ReactDOM from "react-dom/client"

import "./index.css"
import App from "./App"
import OverlayPill from "pages/overlay-pill"
import { ThemeProvider } from "lib/theme"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

const root = ReactDOM.createRoot(rootElement)

const params = new URLSearchParams(window.location.search)
const isOverlay = params.get('view') === 'overlay'
if (isOverlay) {
  document.documentElement.setAttribute('data-overlay', '1')
}

root.render(
  <React.StrictMode>
    <ThemeProvider>
      {isOverlay ? <OverlayPill /> : <App />}
    </ThemeProvider>
  </React.StrictMode>
)
