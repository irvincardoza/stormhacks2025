import React from "react"
import {
  Sparkles as SparklesIcon,
  Brain as BrainIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  ArrowCircle as ArrowCircleIcon,
  SettingsGear as SettingsIcon,
  Users as UsersIcon,
  Star as StarIcon,
  ArrowRight as ArrowRightIcon,
  Lightning as LightningIcon,
  Check as CheckIconBase,
  ChevronRight as ChevronRightIconBase,
  CircleCheck as CircleIconBase,
  X as XIconBase,
  Bell as BellIcon,
  PanelLeftOpen as PanelLeftIconBase,
} from "./icons"

type IconProps = { className?: string }

// Map commonly used lucide-react icon names to our local icons
export const Sparkles = ({ className }: IconProps) => (
  <SparklesIcon className={className} />
)

export const Brain = ({ className }: IconProps) => (
  <BrainIcon className={className} />
)

export const CalendarClock = ({ className }: IconProps) => (
  <CalendarIcon className={className} />
)

export const CalendarDays = ({ className }: IconProps) => (
  <CalendarIcon className={className} />
)

export const Timer = ({ className }: IconProps) => (
  <ClockIcon className={className} />
)

export const Clock3 = ({ className }: IconProps) => (
  <ClockIcon className={className} />
)

export const Target = ({ className }: IconProps) => (
  <ArrowCircleIcon className={className} />
)

export const Settings = ({ className }: IconProps) => (
  <SettingsIcon className={className} />
)

export const Home = ({ className }: IconProps) => (
  <UsersIcon className={className} />
)

export const LineChart = ({ className }: IconProps) => (
  <StarIcon className={className} />
)

export const Play = ({ className }: IconProps) => (
  <ArrowRightIcon className={className} />
)

export const Power = ({ className }: IconProps) => (
  <LightningIcon className={className} />
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
  <BellIcon className={className} />
)

export const BrainCircuit = ({ className }: IconProps) => (
  <BrainIcon className={className} />
)

export const PanelLeftIcon = ({ className }: IconProps) => (
  <PanelLeftIconBase className={className} />
)

export const Bot = ({ className }: IconProps) => (
  <SparklesIcon className={className} />
)

// Additional icons for the new navigation
export const BarChart3 = ({ className }: IconProps) => (
  <StarIcon className={className} />
)

export const Clock = ({ className }: IconProps) => (
  <ClockIcon className={className} />
)

export const Database = ({ className }: IconProps) => (
  <StarIcon className={className} />
)

export const Monitor = ({ className }: IconProps) => (
  <UsersIcon className={className} />
)

export const Pause = ({ className }: IconProps) => (
  <XIconBase className={className} />
)

export const Smartphone = ({ className }: IconProps) => (
  <UsersIcon className={className} />
)

export const TrendingUp = ({ className }: IconProps) => (
  <ArrowRightIcon className={className} />
)

export const MoreHorizontal = ({ className }: IconProps) => (
  <XIconBase className={className} />
)

export const RefreshCw = ({ className }: IconProps) => (
  <ArrowRightIcon className={className} />
)

export const ExternalLink = ({ className }: IconProps) => (
  <ArrowRightIcon className={className} />
)

export const Plus = ({ className }: IconProps) => (
  <CheckIconBase className={className} />
)

export const Trash2 = ({ className }: IconProps) => (
  <XIconBase className={className} />
)

export const Edit = ({ className }: IconProps) => (
  <ArrowRightIcon className={className} />
)


