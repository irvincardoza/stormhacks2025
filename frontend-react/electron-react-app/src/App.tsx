import { DashboardShell } from "components/dashboard/shell"
import { Router, NavigationProvider } from "components/router"
import { DashboardDataProvider } from "providers/dashboard-data-provider"

function App() {
  return (
    <NavigationProvider>
      <DashboardDataProvider>
        <DashboardShell>
          <Router />
        </DashboardShell>
      </DashboardDataProvider>
    </NavigationProvider>
  )
}

export default App
