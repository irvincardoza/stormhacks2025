# Prism Dashboard - Architecture Documentation

## Overview

Prism is a productivity OS dashboard built with React, TypeScript, and Electron. It features an AI-augmented productivity interface with intelligent time tracking, focus management, and data visualization components.

## Application Structure

### Main Entry Point (`App.tsx`)

The application follows a structured layout with the main `App.tsx` component orchestrating the entire dashboard:

```typescript
function App() {
  return (
    <DashboardShell>
      <DashboardTopbar />
      <main className="flex-1 space-y-6 p-6 bg-background">
        {/* Grid-based layout with responsive sections */}
      </main>
    </DashboardShell>
  )
}
```

**Key Properties:**
- **Layout System**: Uses CSS Grid with responsive breakpoints (`lg:grid-cols-12`)
- **Component Structure**: Modular dashboard cards arranged in logical sections
- **Styling**: Tailwind CSS with custom design tokens

## Dashboard Components

### 1. DashboardShell (`components/dashboard/shell.tsx`)

**Purpose**: Main layout wrapper providing sidebar navigation and responsive structure

**Key Features:**
- **Sidebar Navigation**: Collapsible sidebar with primary navigation and AI shortcuts
- **User Profile**: Avatar with dropdown menu for account management
- **Theme Support**: Dark/light mode toggle integration
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts

**Properties Applied:**
```typescript
// Sidebar configuration
const primaryNav = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Timeline", icon: Timer },
  { label: "Insights", icon: Brain },
  { label: "Automation", icon: Bot },
  { label: "Analytics", icon: LineChart },
]

// AI shortcuts for productivity features
const aiShortcuts = [
  { label: "Focus coach", icon: Sparkles },
  { label: "Calendar sync", icon: CalendarClock },
  { label: "Workflow recipes", icon: Sparkles },
]
```

### 2. DashboardTopbar (`components/dashboard/shell.tsx`)

**Purpose**: Top navigation bar with real-time clock and action buttons

**Key Features:**
- **Real-time Clock**: Updates every second with formatted date/time
- **Time Range Selector**: Day/Week view toggle
- **Action Buttons**: Calendar integration, tracking controls, focus mode
- **Theme Toggle**: Mode switching functionality

**Properties Applied:**
```typescript
// Real-time state management
const [currentDate, setCurrentDate] = useState(new Date())

// Date formatting functions
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

## Dashboard Cards

### 1. TimelineCard (`components/dashboard/timeline-card.tsx`)

**Purpose**: Visualizes workday rhythm with stacked bar chart

**Chart Configuration:**
```typescript
const timelineConfig: ChartConfig = {
  focus: {
    label: "Focus",
    color: "var(--chart-1)",
  },
  meetings: {
    label: "Meetings", 
    color: "var(--chart-2)",
  },
  breaks: {
    label: "Breaks",
    color: "var(--chart-3)",
  },
}
```

**Properties Applied:**
- **Chart Type**: Stacked Bar Chart using Recharts
- **Data Source**: `timelineData` from dashboard data
- **Interactive Features**: Tooltips with custom content
- **Styling**: Custom CSS variables for theming

### 2. WorkHoursCard (`components/dashboard/work-hours-card.tsx`)

**Purpose**: Displays work hours tracking with AI suggestions

**Key Features:**
- **Tabbed Interface**: Day/Week view switching
- **Progress Tracking**: Visual progress bars for focus ratios
- **AI Integration**: Dialog with AI schedule suggestions
- **Real-time Stats**: Live tracking status and metrics

**Properties Applied:**
```typescript
// Focus ratio calculation
const focusRatio = 0.981

// Tab-based content switching
<Tabs defaultValue="day" className="w-full">
  <TabsList className="bg-muted/20">
    <TabsTrigger value="day">Day</TabsTrigger>
    <TabsTrigger value="week">Week</TabsTrigger>
  </TabsList>
</Tabs>
```

### 3. BreakTimerCard (`components/dashboard/break-timer-card.tsx`)

**Purpose**: AI-powered break management with cognitive load monitoring

**Key Features:**
- **Cognitive Load Tracking**: Real-time strain level monitoring
- **Break Suggestions**: AI-curated break options
- **Progress Visualization**: Neural recovery progress bars
- **Interactive Dialogs**: Break selection with auto-pause features

**Properties Applied:**
```typescript
// Break suggestion data structure
export const breakSuggestions = [
  {
    title: "Guided reset (7 min)",
    description: "Breathing routine + mobility flow personalized to your focus strain score.",
  },
  // ... more suggestions
]
```

### 4. ScoresCard (`components/dashboard/scores-card.tsx`)

**Purpose**: Radial chart displaying performance metrics

**Chart Configuration:**
```typescript
const chartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "hsl(var(--chart-1))" },
  safari: { label: "Safari", color: "hsl(var(--chart-2))" },
  firefox: { label: "Firefox", color: "hsl(var(--chart-3))" },
  edge: { label: "Edge", color: "hsl(var(--chart-4))" },
  other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig
```

**Properties Applied:**
- **Chart Type**: Radial Bar Chart with grid
- **Interactive Features**: Hover tooltips and legend
- **Responsive Design**: Aspect ratio maintenance
- **Data Visualization**: Browser usage statistics

### 5. TimeBreakdownCard (`components/dashboard/time-breakdown-card.tsx`)

**Purpose**: Shows time allocation across different categories

**Properties Applied:**
```typescript
// Time category data structure
export const timeCategories: TimeCategory[] = [
  { name: "Code", percent: 45, duration: "2h 46m", color: "hsl(var(--chart-1))" },
  { name: "Meetings", percent: 18, duration: "1h 25m", color: "hsl(var(--chart-2))" },
  // ... more categories
]
```

### 6. ProjectsCard (`components/dashboard/projects-card.tsx`)

**Purpose**: AI-attributed time investment by project

**Properties Applied:**
- **Data Source**: `projectBreakdown` from dashboard data
- **Visualization**: Progress bars with percentage and duration
- **Styling**: Backdrop blur effects for modern UI

### 7. ActivityCard (`components/dashboard/activity-card.tsx`)

**Purpose**: Live telemetry from desktop applications and browser tabs

**Key Features:**
- **Scrollable Content**: Virtual scrolling for performance
- **Status Indicators**: Color-coded status badges
- **Real-time Updates**: Live activity monitoring

**Properties Applied:**
```typescript
// Status classification system
function statusClass(status: string) {
  switch (status) {
    case "ok": return "bg-chart-2 text-chart-2-foreground"
    case "review": return "bg-chart-3 text-chart-3-foreground"
    case "deep-work": return "bg-primary text-primary-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}
```

### 8. InsightsCard (`components/dashboard/insights-card.tsx`)

**Purpose**: AI-powered insights with personalized recommendations

**Key Features:**
- **Tabbed Interface**: Multiple insight categories
- **Sentiment Analysis**: Positive, neutral, warning indicators
- **Interactive Elements**: Sheet overlays for detailed views
- **AI Integration**: Context graph visualization

**Properties Applied:**
```typescript
// Sentiment-based styling
const sentimentStyles = {
  positive: "from-chart-1/40 to-primary/10",
  neutral: "from-muted/30 to-muted/10", 
  warning: "from-chart-3/30 to-chart-3/10",
} as const
```

## Chart Components

### 1. ChartLineInteractive (`components/ui/chart-line-interactive.tsx`)

**Purpose**: Interactive line chart with data switching

**Key Features:**
- **Data Toggle**: Desktop/Mobile view switching
- **Interactive Headers**: Clickable metric displays
- **Responsive Design**: Mobile-optimized layouts
- **Tooltip Integration**: Custom formatted tooltips

**Properties Applied:**
```typescript
// Chart configuration
const chartConfig = {
  views: { label: "Page Views" },
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

// Interactive state management
const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop")
```

### 2. ChartAreaInteractive (`components/charts/chart-area-interactive.tsx`)

**Purpose**: Area chart with time range filtering

**Key Features:**
- **Time Range Selector**: 7d, 30d, 90d options
- **Gradient Fills**: Custom area styling
- **Data Filtering**: Dynamic data filtering based on selection
- **Legend Integration**: Interactive legend display

**Properties Applied:**
```typescript
// Time range filtering logic
const filteredData = chartData.filter((item) => {
  const date = new Date(item.date)
  const referenceDate = new Date("2024-06-30")
  let daysToSubtract = 90
  if (timeRange === "30d") daysToSubtract = 30
  else if (timeRange === "7d") daysToSubtract = 7
  const startDate = new Date(referenceDate)
  startDate.setDate(startDate.getDate() - daysToSubtract)
  return date >= startDate
})
```

### 3. ChartBarInteractive (`components/charts/chart-bar-interactive.tsx`)

**Purpose**: Interactive bar chart with metric switching

**Properties Applied:**
- **Chart Type**: Bar Chart with Cartesian grid
- **Interactive Headers**: Metric switching functionality
- **Responsive Design**: Mobile-optimized layouts
- **Accessibility**: Screen reader support

### 4. ChartPieInteractive (`components/charts/chart-pie-interactive.tsx`)

**Purpose**: Interactive pie chart with sector selection

**Key Features:**
- **Sector Interaction**: Active sector highlighting
- **Custom Labels**: Center label with values
- **Selection Interface**: Dropdown for month selection
- **Visual Effects**: Active shape animations

**Properties Applied:**
```typescript
// Active sector configuration
activeShape={({
  outerRadius = 0,
  ...props
}: PieSectorDataItem) => (
  <g>
    <Sector {...props} outerRadius={outerRadius + 10} />
    <Sector
      {...props}
      outerRadius={outerRadius + 25}
      innerRadius={outerRadius + 12}
    />
  </g>
)}
```

## UI Components

### Chart System (`components/ui/chart.tsx`)

**Purpose**: Comprehensive charting system built on Recharts

**Key Features:**
- **Theme Support**: Light/dark mode compatibility
- **Custom Styling**: CSS variable integration
- **Tooltip System**: Advanced tooltip customization
- **Legend Support**: Interactive legend components

**Properties Applied:**
```typescript
// Chart configuration type
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

// Theme support
const THEMES = { light: "", dark: ".dark" } as const
```

### Theme System (`lib/theme.tsx`)

**Purpose**: Theme management with system preference detection

**Key Features:**
- **System Integration**: Automatic dark/light mode detection
- **Persistence**: Local storage theme persistence
- **Context API**: React context for theme state
- **CSS Integration**: Dynamic class toggling

**Properties Applied:**
```typescript
// Theme context
type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// System preference detection
function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}
```

## Data Management

### Dashboard Data (`data/dashboard.ts`)

**Purpose**: Centralized data management for dashboard components

**Data Types:**
```typescript
export type TimelineEntry = {
  hour: string
  focus: number
  meetings: number
  breaks: number
}

export type WorkBlock = {
  time: string
  task: string
  durationMinutes: number
  quality: number
  category: "focus" | "meeting" | "break" | "deep-work"
}

export type ActivityLogItem = {
  time: string
  app: string
  detail: string
  status: "ok" | "review" | "deep-work"
}
```

**Properties Applied:**
- **Type Safety**: Full TypeScript type definitions
- **Data Consistency**: Standardized data structures
- **Mock Data**: Realistic sample data for development
- **Extensibility**: Easy to extend with new data types

## Styling System

### Tailwind CSS Configuration

**Key Features:**
- **Design Tokens**: CSS custom properties for theming
- **Responsive Design**: Mobile-first approach
- **Component Variants**: Class variance authority integration
- **Animation Support**: Tailwind animate CSS integration

**Properties Applied:**
```css
/* Custom CSS variables for theming */
:root {
  --chart-1: hsl(12, 76%, 61%);
  --chart-2: hsl(173, 58%, 39%);
  --chart-3: hsl(197, 37%, 24%);
  --chart-4: hsl(43, 74%, 66%);
  --chart-5: hsl(27, 87%, 67%);
}
```

## Technology Stack

### Core Dependencies

**Frontend Framework:**
- **React 19.2.0**: Latest React with concurrent features
- **TypeScript 4.9.5**: Type safety and development experience
- **Tailwind CSS 3.4.14**: Utility-first CSS framework

**Charting Library:**
- **Recharts 2.15.4**: Composable charting library for React

**UI Components:**
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library with 1000+ icons

**Build Tools:**
- **Electron 38.2.1**: Desktop application framework
- **React Scripts 5.0.1**: Create React App build system
- **Electron Builder**: Application packaging

### Development Tools

**Code Quality:**
- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (via ESLint)

**Build Process:**
- **Webpack**: Module bundling (via React Scripts)
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Architecture Patterns

### Component Composition

**Pattern**: Modular component architecture with clear separation of concerns

**Benefits:**
- **Reusability**: Components can be used across different contexts
- **Maintainability**: Clear component boundaries
- **Testability**: Isolated component testing
- **Scalability**: Easy to extend and modify

### State Management

**Pattern**: React hooks with context API for global state

**Implementation:**
- **Local State**: useState for component-specific state
- **Global State**: Context API for theme management
- **Side Effects**: useEffect for lifecycle management

### Data Flow

**Pattern**: Unidirectional data flow with props drilling

**Benefits:**
- **Predictability**: Clear data flow direction
- **Debugging**: Easy to trace data changes
- **Performance**: Optimized re-rendering

## Performance Optimizations

### React Optimizations

**Techniques Applied:**
- **Memoization**: React.useMemo for expensive calculations
- **Component Splitting**: Small, focused components
- **Lazy Loading**: Dynamic imports for code splitting
- **Virtual Scrolling**: ScrollArea for large lists

### Chart Performance

**Optimizations:**
- **Responsive Containers**: Automatic sizing
- **Data Virtualization**: Efficient data rendering
- **Animation Control**: Reduced motion support
- **Memory Management**: Proper cleanup

## Accessibility Features

### ARIA Support

**Implementation:**
- **Screen Reader Support**: Proper ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant color schemes

### Responsive Design

**Breakpoints:**
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

**Features:**
- **Touch Support**: Mobile-optimized interactions
- **Flexible Layouts**: CSS Grid and Flexbox
- **Scalable Typography**: Responsive text sizing

## Future Enhancements

### Planned Features

**AI Integration:**
- **Real-time Analytics**: Live data processing
- **Predictive Insights**: Machine learning integration
- **Automated Workflows**: Smart task management

**Performance:**
- **Service Workers**: Offline functionality
- **Data Caching**: Intelligent data caching
- **Background Sync**: Seamless data synchronization

**User Experience:**
- **Customizable Dashboards**: User-defined layouts
- **Advanced Filtering**: Complex data queries
- **Export Functionality**: Data export capabilities

---

This documentation provides a comprehensive overview of the Prism dashboard architecture, component structure, and implementation details. The application demonstrates modern React patterns, TypeScript integration, and sophisticated data visualization capabilities.
