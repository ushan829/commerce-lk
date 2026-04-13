import {
  DocumentTextIcon,
  PencilSquareIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "short-notes": DocumentTextIcon,
  "model-papers": PencilSquareIcon,
  "past-papers": BookOpenIcon,
  "marking-schemes": ClipboardDocumentCheckIcon,
  "1st-term-test-papers": TagIcon,
  "2nd-term-test-papers": TagIcon,
  "3rd-term-test-papers": TagIcon,
};

// Numbered badge for term papers
const TERM_LABELS: Record<string, string> = {
  "1st-term-test-papers": "T1",
  "2nd-term-test-papers": "T2",
  "3rd-term-test-papers": "T3",
};

interface CategoryIconProps {
  slug: string;
  className?: string;
  containerClassName?: string;
}

export default function CategoryIcon({ slug, className = "w-6 h-6", containerClassName }: CategoryIconProps) {
  const termLabel = TERM_LABELS[slug];

  if (termLabel) {
    return (
      <span
        className={
          containerClassName ??
          "inline-flex items-center justify-center w-6 h-6 text-xs font-bold"
        }
      >
        {termLabel}
      </span>
    );
  }

  const Icon = CATEGORY_ICONS[slug] ?? DocumentTextIcon;
  return <Icon className={className} />;
}
