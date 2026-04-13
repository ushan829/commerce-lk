import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import Resource from "@/models/Resource";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import ResourceListClient from "@/components/resource/ResourceListClient";
import AdBanner from "@/components/ads/AdBanner";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subject: string; medium: string; category: string }>;
}

const MEDIUM_LABELS: Record<string, string> = {
  sinhala: "Sinhala",
  tamil: "Tamil",
  english: "English",
};

async function getData(subjectSlug: string, medium: string, categorySlug: string) {
  await dbConnect();
  const validMediums = ["sinhala", "tamil", "english"];
  if (!validMediums.includes(medium)) return null;

  const [subject, category] = await Promise.all([
    Subject.findOne({ slug: subjectSlug, isActive: true }).lean(),
    Category.findOne({ slug: categorySlug, isActive: true }).lean(),
  ]);

  if (!subject || !category) return null;

  const resources = await Resource.find({
    subject: (subject as any)._id,
    medium,
    category: (category as any)._id,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    subject: JSON.parse(JSON.stringify(subject)),
    category: JSON.parse(JSON.stringify(category)),
    resources: JSON.parse(JSON.stringify(resources)),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: subjectSlug, medium, category: categorySlug } = await params;
  const data = await getData(subjectSlug, medium, categorySlug);
  if (!data) return { title: "Not Found" };
  const mediumLabel = MEDIUM_LABELS[medium] || medium;
  return { title: `${data.category.name} - ${data.subject.name} ${mediumLabel} | Commerce.lk` };
}

export default async function CategoryPage({ params }: Props) {
  const { subject: subjectSlug, medium, category: categorySlug } = await params;
  const data = await getData(subjectSlug, medium, categorySlug);
  if (!data) notFound();

  const { subject, category, resources } = data;
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
              <Link href={`/${subjectSlug}`} className="hover:text-blue-600 transition-colors">{subject.name}</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <Link href={`/${subjectSlug}/${medium}`} className="hover:text-blue-600 transition-colors">{mediumLabel}</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{category.name}</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900">
              {category.name} <span className="text-blue-600">Materials</span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              {resources.length} free resources available for {subject.name} in {mediumLabel} medium.
            </p>
          </div>
        </div>

        <AdBanner position="category-top" />

        {/* Resource List */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
              <div className="lg:col-span-8">
                <ResourceListClient 
                  resources={resources} 
                  subjectName={subject.name} 
                  categoryName={category.name}
                  baseUrl={`/${subjectSlug}/${medium}/${categorySlug}`}
                />
              </div>
              
              <aside className="lg:col-span-4">
                <div className="sticky top-24">
                  <AdBanner position="category-sidebar" />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
