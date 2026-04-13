import Link from "next/link";
import { 
  ChevronRightIcon,
  BookOpenIcon, 
  PresentationChartBarIcon, 
  ChartBarIcon, 
  CalculatorIcon, 
  ComputerDesktopIcon, 
  LanguageIcon 
} from "@heroicons/react/24/outline";

interface Subject {
  _id: string;
  name: string;
  slug: string;
}

const getIcon = (slug: string) => {
  switch (slug) {
    case "accounting": return <BookOpenIcon className="w-8 h-8 text-blue-600" />;
    case "business-studies": return <PresentationChartBarIcon className="w-8 h-8 text-blue-600" />;
    case "economics": return <ChartBarIcon className="w-8 h-8 text-blue-600" />;
    case "business-statistics": return <CalculatorIcon className="w-8 h-8 text-blue-600" />;
    case "ict": return <ComputerDesktopIcon className="w-8 h-8 text-blue-600" />;
    case "general-english": return <LanguageIcon className="w-8 h-8 text-blue-600" />;
    default: return <BookOpenIcon className="w-8 h-8 text-blue-600" />;
  }
};

export default function SubjectsGrid({ subjects }: { subjects: Subject[] }) {
  if (subjects.length === 0) return null;

  return (
    <section id="subjects" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Subjects</h2>
          <Link
            href="/search"
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            Browse all <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid (2x4 on large screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject._id}
              href={`/${subject.slug}`}
              className="group p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 flex flex-col items-start gap-4"
            >
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-white transition-colors">
                {getIcon(subject.slug)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {subject.name}
                </h3>
                <p className="text-gray-500 text-sm">Past papers, notes & more</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ChevronRightIcon className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
