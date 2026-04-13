import {
  BookOpenIcon,
  LanguageIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export const MEDIUM_INFO = [
  {
    value: "sinhala",
    label: "Sinhala Medium",
    shortLabel: "Sinhala",
    nativeLabel: "සිංහල",
    Icon: BookOpenIcon,
    colorClasses: {
      bg:     "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50",
      iconBg: "bg-primary/10",
      icon:   "text-primary",
      text:   "text-gray-900",
      badge:  "bg-primary/10 text-primary",
    },
  },
  {
    value: "tamil",
    label: "Tamil Medium",
    shortLabel: "Tamil",
    nativeLabel: "தமிழ்",
    Icon: LanguageIcon,
    colorClasses: {
      bg:     "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50",
      iconBg: "bg-gray-100",
      icon:   "text-gray-600",
      text:   "text-gray-900",
      badge:  "bg-gray-100 text-gray-600",
    },
  },
  {
    value: "english",
    label: "English Medium",
    shortLabel: "English",
    nativeLabel: "English",
    Icon: AcademicCapIcon,
    colorClasses: {
      bg:     "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50",
      iconBg: "bg-gray-100",
      icon:   "text-gray-600",
      text:   "text-gray-900",
      badge:  "bg-gray-100 text-gray-600",
    },
  },
] as const;
