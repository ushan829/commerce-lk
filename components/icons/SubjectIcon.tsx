import {
  Calculator,
  TrendingUp,
  BarChart3,
  PieChart,
  Monitor,
  Globe,
  BookOpen,
  Cpu,
  GraduationCap,
} from "lucide-react";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  accounting: Calculator,
  "business-studies": TrendingUp,
  economics: BarChart3,
  "business-statistics": PieChart,
  ict: Monitor,
  "general-english": Globe,
  "common-general-test": BookOpen,
  git: Cpu,
};

interface SubjectIconProps {
  slug: string;
  className?: string;
}

export default function SubjectIcon({ slug, className = "w-6 h-6" }: SubjectIconProps) {
  const Icon = SUBJECT_ICONS[slug] ?? GraduationCap;
  return <Icon className={className} />;
}
