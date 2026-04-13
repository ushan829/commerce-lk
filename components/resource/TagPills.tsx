import Link from "next/link";
import { TagIcon } from "@heroicons/react/24/outline";

interface Props {
  tags: string[];
  subjectSlug: string;
  medium: string;
  categorySlug: string;
}

export default function TagPills({ tags, subjectSlug, medium, categorySlug }: Props) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <TagIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-500">Tags</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/${subjectSlug}/${medium}/${categorySlug}?tag=${encodeURIComponent(tag)}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors font-medium"
          >
            <span className="text-gray-400">#</span>
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
