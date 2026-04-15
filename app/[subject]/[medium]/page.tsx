import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import Resource from "@/models/Resource";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import AdBanner from "@/components/ads/AdBanner";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subject: string; medium: string }>;
}

const MEDIUM_LABELS: Record<string, string> = {
  sinhala: "Sinhala",
  tamil: "Tamil",
  english: "English",
};

async function getData(subjectSlug: string, medium: string) {
  await dbConnect();
  const validMediums = ["sinhala", "tamil", "english"];
  if (!validMediums.includes(medium)) return null;

  const [subject, categories] = await Promise.all([
    Subject.findOne({ slug: subjectSlug, isActive: true }).lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
  ]);

  if (!subject) return null;

  // Single aggregation query instead of N+1 countDocuments
  const categoryCounts = await Resource.aggregate([
    {
      $match: {
        subject: (subject as any)._id,
        medium,
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    categoryCounts.map((c: any) => [c._id.toString(), c.count])
  );

  const categoriesWithCounts = (categories as any[]).map((cat) => ({
    ...cat,
    _id: cat._id.toString(),
    count: countMap.get(cat._id.toString()) || 0,
  }));

  return {
    subject: {
      ...subject,
      _id: (subject as any)._id.toString(),
    },
    categories: categoriesWithCounts,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: subjectSlug, medium } = await params;
  const data = await getData(subjectSlug, medium);
  if (!data) return { title: "Not Found" };
  const mediumLabel = MEDIUM_LABELS[medium] || medium;
  const subjectName = (data.subject as any).name;
  return {
    title: `${subjectName} ${mediumLabel} Medium - Study Materials`,
    description: `Free ${subjectName} study materials in ${mediumLabel} medium for Sri Lanka A/L students.`,
  };
}

export default async function MediumPage({ params }: Props) {
  const { subject: subjectSlug, medium } = await params;
  const data = await getData(subjectSlug, medium);
  if (!data) notFound();

  const { subject, categories } = data;
  const mediumLabel = MEDIUM_LABELS[medium] || medium;

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
              <Link href={`/${subjectSlug}`} className="hover:text-blue-600 transition-colors">{(subject as any).name}</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{mediumLabel} Medium</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900">
              {(subject as any).name} <span className="text-blue-600">Resources</span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Browse materials by category in {mediumLabel} medium.</p>
          </div>
        </div>

        <AdBanner position="subject-top" />

        {/* Categories List */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/${subjectSlug}/${medium}/${cat.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <ArrowRightIcon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                      <p className="text-gray-500 text-sm">Download {cat.name.toLowerCase()} here</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{cat.count || 0}</div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Resources</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
