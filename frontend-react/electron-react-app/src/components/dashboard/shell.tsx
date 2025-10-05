import { ReactNode, useState, useEffect } from "react"
import { useNavigation } from "components/router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "components/ui/sidebar"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "components/ui/avatar"
import { BarChart3, CalendarDays, Clock, Home, Settings, Target, Timer } from "components/icons/lucide-adapter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "components/ui/tabs"
import { ModeToggle } from "components/ui/mode-toggle"
import { useIdleData } from "providers/dashboard-data-provider"

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h <= 0) return `${m}m`
  return `${h}h ${m}m`
}

const primaryNav = [
  { label: "Overview", icon: Home, href: "/dashboard" },
  { label: "Timeline", icon: Clock, href: "/dashboard/timeline" },
  { label: "Insights", icon: BarChart3, href: "/dashboard/insights" },
  { label: "Sessions", icon: Target, href: "/dashboard/sessions" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

type DashboardShellProps = {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { currentPath, navigate } = useNavigation()
  const idle = useIdleData()
  
  return (
    <SidebarProvider>
      <div className="bg-background text-foreground min-h-screen">
        <div className="flex min-h-screen">
          {renderSidebar(currentPath, navigate, idle.trackedMinutes || 0)}
          <SidebarInset className="bg-background flex-1">
            <div className="flex flex-col min-h-screen">{children}</div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}

function renderSidebar(currentPath: string, navigate: (path: string) => void, trackedMinutes: number) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border bg-sidebar sidebar-glass">
      <SidebarHeader className="gap-3 p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Target className="size-5" />
          </div>
          <div className="grid gap-0.5">
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">Prism</span>
            <span className="text-xs text-muted-foreground">Productivity OS</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    isActive={currentPath === item.href}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <div>
            <p className="text-xs font-medium text-sidebar-accent-foreground">Productivity</p>
            <p className="text-[10px] text-muted-foreground">Tracked time today</p>
          </div>
              <Badge className="bg-success text-white text-[10px]">{formatMinutes(trackedMinutes)}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="justify-start gap-3 px-2">
              <Avatar className="size-8">
                <AvatarImage src="https://i.pravatar.cc/200?u=focus" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium leading-tight">User</p>
                <p className="text-xs text-muted-foreground">Productivity Tracker</p>
              </div>
              <Settings className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Notification settings</DropdownMenuItem>
            <DropdownMenuItem>Integrations</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function DashboardTopbar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border/0 px-6 py-4 md:flex-row md:items-center md:justify-between glass-card mx-4 my-4 rounded-xl">
      <div className="flex flex-1 items-center gap-4">
        <SidebarTrigger className="hidden md:flex" />
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {formatDate(currentDate)} • {formatTime(currentDate)}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Prism</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your adaptive productivity OS with intelligent time orchestration.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Tabs defaultValue="day" className="hidden md:flex">
          <TabsList className="bg-muted/20">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-border/50">
              <CalendarDays className="size-4" /> Calendar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Jump to</DropdownMenuLabel>
            <DropdownMenuItem>This week</DropdownMenuItem>
            <DropdownMenuItem>Next 7 days</DropdownMenuItem>
            <DropdownMenuItem>Focus sprint planner</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Connect calendar...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="gap-2 border-info/40 text-info hover:bg-info/10">
          <Timer className="size-4" /> Disable tracking
        </Button>
        <Button size="sm" className="gap-2 text-white bg-[linear-gradient(to_top_right,hsl(var(--primary)),hsl(var(--chart-4)))] hover:opacity-90">
          <Target className="size-4" /> Start focus mode
        </Button>
        <ModeToggle />
      </div>
    </div>
  )
}
