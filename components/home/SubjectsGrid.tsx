import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSubjectConfig } from '@/lib/subjectConfig';
import SubjectIcon from '@/components/ui/SubjectIcon';

interface Subject {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function SubjectsGrid({ subjects }: { subjects: Subject[] }) {
  if (subjects.length === 0) return null;

  return (
    <section id="subjects" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse by Subject</h2>
            <p className="text-sm text-gray-500 mt-1">Explore resources organized by your A/L subjects</p>
          </div>
          <Link
            href="/search"
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((subject) => {
            const config = getSubjectConfig(subject.slug)
            return (
              <Link
                key={subject._id}
                href={`/${subject.slug}`}
                className={`group bg-white rounded-2xl border ${config.borderColor} shadow-sm hover:shadow-md hover:border-blue-200 p-5 transition-all duration-200 flex flex-col items-center text-center`}
              >
                <div className={`w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center mb-3 transition-colors ${config.iconColor}`}>
                  <SubjectIcon iconName={config.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Past papers, notes & more</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  );
}
