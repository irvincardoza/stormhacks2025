import React from "react"
import {
  Sparkles as SparklesIcon,
  Brain as BrainIcon,
  Clock as ClockIcon,
  SettingsGear as SettingsIcon,
  Users as UsersIcon,
  Star as StarIcon,
  Check as CheckIconBase,
  ChevronRight as ChevronRightIconBase,
  CircleCheck as CircleIconBase,
  X as XIconBase,
  PanelLeftOpen as PanelLeftIconBase,
  Plus as PlusIconBase,
  VSCode as VSCodeIcon,
  ChromeIcon as ChromeIconBase,
  FigmaIcon as FigmaIconBase,
  SlackIcon as SlackIconBase,
  TerminalIcon as TerminalIconBase,
  SystemIcon as SystemIconBase,
} from "./icons"
import {
  AlarmClock as LucideAlarmClockIcon,
  BarChart3 as LucideBarChart3Icon,
  BrainCircuit as LucideBrainCircuitIcon,
  CalendarClock as LucideCalendarClockIcon,
  CalendarDays as LucideCalendarDaysIcon,
  Clock3 as LucideClock3Icon,
  Database as LucideDatabaseIcon,
  Edit as LucideEditIcon,
  ExternalLink as LucideExternalLinkIcon,
  Home as LucideHomeIcon,
  Monitor as LucideMonitorIcon,
  MoreHorizontal as LucideMoreHorizontalIcon,
  Pause as LucidePauseIcon,
  Play as LucidePlayIcon,
  Power as LucidePowerIcon,
  RefreshCw as LucideRefreshCwIcon,
  Target as LucideTargetIcon,
  Timer as LucideTimerIcon,
  TrendingUp as LucideTrendingUpIcon,
  Trash2 as LucideTrash2Icon,
} from "lucide-react"

type IconProps = { className?: string }

// Map commonly used lucide-react icon names to our local icons
export const Sparkles = ({ className }: IconProps) => (
  <SparklesIcon className={className} />
)

export const Brain = ({ className }: IconProps) => (
  <BrainIcon className={className} />
)

export const CalendarClock = ({ className }: IconProps) => (
  <LucideCalendarClockIcon className={className} />
)

export const CalendarDays = ({ className }: IconProps) => (
  <LucideCalendarDaysIcon className={className} />
)

export const Timer = ({ className }: IconProps) => (
  <LucideTimerIcon className={className} />
)

export const Clock3 = ({ className }: IconProps) => (
  <LucideClock3Icon className={className} />
)

export const Target = ({ className }: IconProps) => (
  <LucideTargetIcon className={className} />
)

export const Settings = ({ className }: IconProps) => (
  <SettingsIcon className={className} />
)

export const Home = ({ className }: IconProps) => (
  <LucideHomeIcon className={className} />
)

export const LineChart = ({ className }: IconProps) => (
  <StarIcon className={className} />
)

export const Play = ({ className }: IconProps) => (
  <LucidePlayIcon className={className} />
)

export const Power = ({ className }: IconProps) => (
  <LucidePowerIcon className={className} />
)

export const Check = ({ className }: IconProps) => (
  <CheckIconBase className={className} />
)

export const ChevronRightIcon = ({ className }: IconProps) => (
  <ChevronRightIconBase className={className} />
)

// Use a simple circle check as radio indicator fallback
export const CircleIcon = ({ className }: IconProps) => (
  <CircleIconBase className={className} />
)

export const XIcon = ({ className }: IconProps) => (
  <XIconBase className={className} />
)

export const AlarmClock = ({ className }: IconProps) => (
  <LucideAlarmClockIcon className={className} />
)

export const BrainCircuit = ({ className }: IconProps) => (
  <LucideBrainCircuitIcon className={className} />
)

export const PanelLeftIcon = ({ className }: IconProps) => (
  <PanelLeftIconBase className={className} />
)

export const Bot = ({ className }: IconProps) => (
  <SparklesIcon className={className} />
)

// Additional icons for the new navigation
export const BarChart3 = ({ className }: IconProps) => (
  <LucideBarChart3Icon className={className} />
)

export const Clock = ({ className }: IconProps) => (
  <ClockIcon className={className} />
)

export const Database = ({ className }: IconProps) => (
  <LucideDatabaseIcon className={className} />
)

export const Monitor = ({ className }: IconProps) => (
  <LucideMonitorIcon className={className} />
)

export const Pause = ({ className }: IconProps) => (
  <LucidePauseIcon className={className} />
)

export const Smartphone = ({ className }: IconProps) => (
  <UsersIcon className={className} />
)

export const TrendingUp = ({ className }: IconProps) => (
  <LucideTrendingUpIcon className={className} />
)

export const MoreHorizontal = ({ className }: IconProps) => (
  <LucideMoreHorizontalIcon className={className} />
)

export const RefreshCw = ({ className }: IconProps) => (
  <LucideRefreshCwIcon className={className} />
)

export const ExternalLink = ({ className }: IconProps) => (
  <LucideExternalLinkIcon className={className} />
)

export const Plus = ({ className }: IconProps) => (
  <PlusIconBase className={className} />
)

export const Trash2 = ({ className }: IconProps) => (
  <LucideTrash2Icon className={className} />
)

export const Edit = ({ className }: IconProps) => (
  <LucideEditIcon className={className} />
)

// App Icons
export const VSCode = ({ className }: IconProps) => (
  <VSCodeIcon className={className} />
)

export const ChromeIcon = ({ className }: IconProps) => (
  <ChromeIconBase className={className} />
)

export const FigmaIcon = ({ className }: IconProps) => (
  <FigmaIconBase className={className} />
)

export const SlackIcon = ({ className }: IconProps) => (
  <SlackIconBase className={className} />
)

export const TerminalIcon = ({ className }: IconProps) => (
  <TerminalIconBase className={className} />
)

export const SystemIcon = ({ className }: IconProps) => (
  <SystemIconBase className={className} />
)


