import { DashboardShell } from "components/dashboard/shell"
import { Router, NavigationProvider } from "components/router"

function App() {
  return (
    <NavigationProvider>
      <DashboardShell>
        <Router />
      </DashboardShell>
    </NavigationProvider>
  )
}

export default App
