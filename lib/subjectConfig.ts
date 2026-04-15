import {
  Calculator,
  TrendingUp,
  BarChart3,
  PieChart,
  Monitor,
  Globe,
  BookOpen,
  Cpu,
  BookMarked,
} from 'lucide-react'

export interface SubjectConfig {
  icon: string // icon name string (for server-safe usage)
  bg: string
  iconColor: string
  borderColor: string
}

export const subjectConfigMap: Record<string, SubjectConfig> = {
  accounting: {
    icon: 'Calculator',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  'business-studies': {
    icon: 'TrendingUp',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-100',
  },
  economics: {
    icon: 'BarChart3',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-100',
  },
  'business-statistics': {
    icon: 'PieChart',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-100',
  },
  ict: {
    icon: 'Monitor',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-100',
  },
  'general-english': {
    icon: 'Globe',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    borderColor: 'border-pink-100',
  },
  'common-general-test': {
    icon: 'BookOpen',
    bg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-100',
  },
  git: {
    icon: 'Cpu',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-100',
  },
}

export const defaultSubjectConfig: SubjectConfig = {
  icon: 'BookMarked',
  bg: 'bg-gray-50',
  iconColor: 'text-gray-600',
  borderColor: 'border-gray-100',
}

export function getSubjectConfig(slug: string): SubjectConfig {
  return subjectConfigMap[slug] || defaultSubjectConfig
}
