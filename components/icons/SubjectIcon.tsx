import {
  CalculatorIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  ClipboardDocumentListIcon,
  CommandLineIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  accounting: CalculatorIcon,
  "business-studies": BriefcaseIcon,
  economics: ArrowTrendingUpIcon,
  "business-statistics": ChartBarIcon,
  ict: ComputerDesktopIcon,
  "general-english": LanguageIcon,
  "common-general-test": ClipboardDocumentListIcon,
  git: CommandLineIcon,
};

interface SubjectIconProps {
  slug: string;
  className?: string;
}

export default function SubjectIcon({ slug, className = "w-6 h-6" }: SubjectIconProps) {
  const Icon = SUBJECT_ICONS[slug] ?? AcademicCapIcon;
  return <Icon className={className} />;
}
