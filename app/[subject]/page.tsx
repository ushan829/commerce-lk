import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Resource from "@/models/Resource";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import AdBanner from "@/components/ads/AdBanner";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subject: string }>;
}

async function getSubject(slug: string) {
  await dbConnect();
  const subject = await Subject.findOne({ slug, isActive: true }).lean();
  return subject ? JSON.parse(JSON.stringify(subject)) : null;
}

async function getSubjectStats(subjectId: string) {
  const mediums = ["sinhala", "tamil", "english"];
  const counts: Record<string, number> = {};
  for (const m of mediums) {
    counts[m] = await Resource.countDocuments({ subject: subjectId, medium: m, isActive: true });
  }

  const aggregate = await Resource.aggregate([
    { $match: { subject: subjectId, isActive: true } },
    {
      $group: {
        _id: null,
        totalDownloads: { $sum: "$downloadCount" },
        totalViews: { $sum: "$viewCount" },
        totalResources: { $sum: 1 },
      },
    },
  ]);

  return {
    mediumCounts: counts,
    totalDownloads: aggregate[0]?.totalDownloads || 0,
    totalViews: aggregate[0]?.totalViews || 0,
    totalResources: aggregate[0]?.totalResources || 0,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) return { title: "Not Found" };
  const title = subject.seoTitle || `${subject.name} A/L Study Materials — Commerce.lk`;
  return { title, alternates: { canonical: `/${slug}` } };
}

export default async function SubjectPage({ params }: Props) {
  const { subject: slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const stats = await getSubjectStats(subject._id);

  const mediums = [
    { name: "Sinhala Medium", value: "sinhala", color: "bg-blue-600", lightColor: "bg-blue-50", textColor: "text-blue-600" },
    { name: "Tamil Medium", value: "tamil", color: "bg-emerald-600", lightColor: "bg-emerald-50", textColor: "text-emerald-600" },
    { name: "English Medium", value: "english", color: "bg-purple-600", lightColor: "bg-purple-50", textColor: "text-purple-600" },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb & Header */}
        <div className="bg-gray-50 border-b border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{subject.name}</span>
            </nav>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{subject.name}</h1>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              {subject.description || `Comprehensive collection of ${subject.name} study materials, past papers, and model papers for A/L students.`}
            </p>
          </div>
        </div>

        <AdBanner position="subject-top" />

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-10">
            
            {/* Medium Selection (Left 8 cols) */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-10">Select your medium</h2>
              <div className="space-y-6">
                {mediums.map((m) => (
                  <Link
                    key={m.value}
                    href={`/${slug}/${m.value}`}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 ${m.lightColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                        <div className={`w-4 h-4 rounded-full ${m.color}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{m.name}</h3>
                        <p className="text-gray-500">
                          {stats.mediumCounts[m.value] || 0} resources available
                        </p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${m.textColor} font-bold`}>
                      Browse <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Stats (Right 4 cols) */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Statistics</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <DocumentTextIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalResources}</p>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Resources</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <ArrowDownTrayIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Downloads</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <EyeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Views</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-3xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Need help?</h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Can't find the resource you're looking for? Request it and our team will try to source it.
                  </p>
                  <Link href="/requests" className="block w-full bg-white text-blue-600 text-center py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                    Request Resource
                  </Link>
                </div>
              </div>
            </aside>

          </div>
        </div>
        <AdBanner position="subject-bottom" />
      </main>
      <Footer />
    </>
  );
}
