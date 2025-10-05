import { useState, createContext, useContext } from "react"
import { OverviewPage } from "pages/overview"
import { TimelinePage } from "pages/timeline"
import { InsightsPage } from "pages/insights"
import { SessionsPage } from "pages/sessions"
import { SettingsPage } from "pages/settings"

type Route = {
  path: string
  component: React.ComponentType
  title: string
}

const routes: Route[] = [
  { path: "/dashboard", component: OverviewPage, title: "Overview" },
  { path: "/dashboard/timeline", component: TimelinePage, title: "Timeline" },
  { path: "/dashboard/insights", component: InsightsPage, title: "Insights" },
  { path: "/dashboard/sessions", component: SessionsPage, title: "Sessions" },
  { path: "/dashboard/settings", component: SettingsPage, title: "Settings" },
]

// Create navigation context
interface NavigationContextType {
  currentPath: string
  navigate: (path: string) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState("/dashboard")

  const navigate = (path: string) => {
    setCurrentPath(path)
  }

  return (
    <NavigationContext.Provider value={{ currentPath, navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function Router() {
  const { currentPath } = useNavigation()
  
  const currentRoute = routes.find(route => route.path === currentPath)
  const CurrentComponent = currentRoute?.component || OverviewPage

  return <CurrentComponent />
}
