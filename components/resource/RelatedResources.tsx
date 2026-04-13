import Link from "next/link";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface RelatedResource {
  _id: string;
  title: string;
  slug: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  viewCount: number;
  year?: number;
  term?: string;
  thumbnail?: string;
  ogImage?: string;
  subject: { name: string; slug: string; color?: string };
  category: { name: string; slug: string };
  medium: string;
  createdAt: string;
}

interface Props {
  resources: RelatedResource[];
  subjectSlug: string;
  medium: string;
  categorySlug: string;
  currentSlug: string;
}

export default function RelatedResources({
  resources,
  subjectSlug,
  medium,
  categorySlug,
  currentSlug,
}: Props) {
  const filtered = resources.filter((r) => r.slug !== currentSlug).slice(0, 8);
  if (filtered.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
        Related Resources
      </h3>
      <div className="space-y-3">
        {filtered.map((r) => {
          const href = `/${subjectSlug}/${medium}/${categorySlug}/${r.slug}`;
          return (
            <Link
              key={r._id}
              href={href}
              className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
            >
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-blue-50 shrink-0 flex items-center justify-center">
                {r.thumbnail || r.ogImage ? (
                  <Image
                    src={r.thumbnail || r.ogImage!}
                    alt={r.title}
                    width={80}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <DocumentIcon className="w-6 h-6 text-blue-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
                  {r.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {r.year && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                      <CalendarIcon className="w-3 h-3" />
                      {r.year}
                    </span>
                  )}
                  {r.term && (
                    <span className="text-xs text-gray-400">{r.term} Term</span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                    <ArrowDownTrayIcon className="w-3 h-3" />
                    {r.downloadCount}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                    <EyeIcon className="w-3 h-3" />
                    {r.viewCount}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
