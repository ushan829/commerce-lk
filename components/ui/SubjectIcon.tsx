'use client'

import {
  Calculator, TrendingUp, BarChart3, PieChart,
  Monitor, Globe, BookOpen, Cpu, BookMarked,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  TrendingUp,
  BarChart3,
  PieChart,
  Monitor,
  Globe,
  BookOpen,
  Cpu,
  BookMarked,
}

interface SubjectIconProps {
  iconName: string
  className?: string
}

export default function SubjectIcon({ iconName, className = 'w-6 h-6' }: SubjectIconProps) {
  const Icon = iconMap[iconName] || BookMarked
  return <Icon className={className} />
}
