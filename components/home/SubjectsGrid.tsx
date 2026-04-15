import Link from "next/link";
import { 
  ChevronRight,
  Calculator,
  TrendingUp,
  BarChart3,
  BookOpen,
  Monitor,
  Globe,
  FileText,
  Cpu,
  BookMarked,
  PieChart,
  Landmark,
  GraduationCap
} from "lucide-react";

interface Subject {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

const getSubjectIcon = (subjectName: string) => {
  const name = subjectName?.toLowerCase() || ''
  
  if (name.includes('accounting')) return <Calculator className="w-6 h-6" />
  if (name.includes('business studies') || name.includes('business s')) return <TrendingUp className="w-6 h-6" />
  if (name.includes('economics')) return <BarChart3 className="w-6 h-6" />
  if (name.includes('statistics') || name.includes('business stat')) return <PieChart className="w-6 h-6" />
  if (name.includes('ict') || name.includes('information')) return <Monitor className="w-6 h-6" />
  if (name.includes('english')) return <Globe className="w-6 h-6" />
  if (name.includes('common general') || name.includes('general test')) return <BookOpen className="w-6 h-6" />
  if (name.includes('git')) return <Cpu className="w-6 h-6" />
  return <BookMarked className="w-6 h-6" />
}

const getSubjectColor = (subjectName: string) => {
  const name = subjectName?.toLowerCase() || ''
  if (name.includes('accounting')) return { bg: 'bg-blue-50 group-hover:bg-blue-100', icon: 'text-blue-600' }
  if (name.includes('business studies')) return { bg: 'bg-green-50 group-hover:bg-green-100', icon: 'text-green-600' }
  if (name.includes('economics')) return { bg: 'bg-purple-50 group-hover:bg-purple-100', icon: 'text-purple-600' }
  if (name.includes('statistics')) return { bg: 'bg-orange-50 group-hover:bg-orange-100', icon: 'text-orange-600' }
  if (name.includes('ict')) return { bg: 'bg-cyan-50 group-hover:bg-cyan-100', icon: 'text-cyan-600' }
  if (name.includes('english')) return { bg: 'bg-pink-50 group-hover:bg-pink-100', icon: 'text-pink-600' }
  if (name.includes('common general')) return { bg: 'bg-yellow-50 group-hover:bg-yellow-100', icon: 'text-yellow-600' }
  if (name.includes('git')) return { bg: 'bg-indigo-50 group-hover:bg-indigo-100', icon: 'text-indigo-600' }
  return { bg: 'bg-gray-50 group-hover:bg-gray-100', icon: 'text-gray-600' }
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
            const colors = getSubjectColor(subject.name)
            return (
              <Link
                key={subject._id}
                href={`/${subject.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 p-5 transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center mb-3 transition-colors ${colors.icon}`}>
                  {getSubjectIcon(subject.name)}
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
