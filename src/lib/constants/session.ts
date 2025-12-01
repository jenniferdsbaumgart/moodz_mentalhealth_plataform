import { SessionCategory } from "@prisma/client"
import {
  Zap,
  CloudRain,
  Heart,
  Flame,
  Users,
  Smile,
  Brain,
  AlertTriangle,
  Cigarette,
  Baby,
  Briefcase,
  MessageCircle,
} from "lucide-react"

export const SESSION_CATEGORIES = {
  ANXIETY: { label: "Ansiedade", icon: Zap, color: "yellow" },
  DEPRESSION: { label: "Depressão", icon: CloudRain, color: "blue" },
  GRIEF: { label: "Luto", icon: Heart, color: "purple" },
  TRAUMA: { label: "Trauma", icon: Flame, color: "red" },
  RELATIONSHIPS: { label: "Relacionamentos", icon: Users, color: "pink" },
  SELF_ESTEEM: { label: "Autoestima", icon: Smile, color: "green" },
  NEURODIVERGENCE: { label: "Neurodivergência", icon: Brain, color: "indigo" },
  STRESS: { label: "Estresse", icon: AlertTriangle, color: "orange" },
  ADDICTION: { label: "Vícios", icon: Cigarette, color: "gray" },
  PARENTING: { label: "Parentalidade", icon: Baby, color: "cyan" },
  CAREER: { label: "Carreira", icon: Briefcase, color: "slate" },
  GENERAL: { label: "Geral", icon: MessageCircle, color: "emerald" },
} as const

export type SessionCategoryConfig = typeof SESSION_CATEGORIES[SessionCategory]


