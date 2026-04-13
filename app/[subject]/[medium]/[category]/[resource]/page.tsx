import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DownloadButton from "@/components/resource/DownloadButton";
import BookmarkButton from "@/components/resource/BookmarkButton";
import TagPills from "@/components/resource/TagPills";
import RelatedResources from "@/components/resource/RelatedResources";
import ShareButtons from "@/components/resource/ShareButtons";
import RatingSection from "@/components/resource/RatingSection";
import ReportButton from "@/components/resource/ReportButton";
import ExamCountdown from "@/components/home/ExamCountdown";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import Resource from "@/models/Resource";
import { formatDate } from "@/lib/utils";
import {
  ChevronRightIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import AdBanner from "@/components/ads/AdBanner";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    subject: string;
    medium: string;
    category: string;
    resource: string;
  }>;
}

const MEDIUM_LABELS: Record<string, string> = {
  sinhala: "Sinhala",
  tamil: "Tamil",
  english: "English",
};

async function getData(
  subjectSlug: string,
  medium: string,
  categorySlug: string,
  resourceSlug: string
) {
  await dbConnect();
  const validMediums = ["sinhala", "tamil", "english"];
  if (!validMediums.includes(medium)) return null;

  const [subject, category] = await Promise.all([
    Subject.findOne({ slug: subjectSlug, isActive: true }).lean(),
    Category.findOne({ slug: categorySlug, isActive: true }).lean(),
  ]);

  if (!subject || !category) return null;

  const resource = await Resource.findOne({ slug: resourceSlug, isActive: true })
    .populate("subject", "name slug color icon")
    .populate("category", "name slug")
    .lean();

  if (!resource) return null;

  Resource.findByIdAndUpdate((resource as any)._id, { $inc: { viewCount: 1 } }).catch(() => {});

  const related = await Resource.find({
    subject: (resource as any).subject._id,
    category: (resource as any).category._id,
    medium,
    isActive: true,
    slug: { $ne: resourceSlug },
  })
    .select("title slug fileType fileSize downloadCount viewCount year term thumbnail ogImage createdAt")
    .limit(5)
    .lean();

  return {
    resource: JSON.parse(JSON.stringify(resource)),
    related: JSON.parse(JSON.stringify(related)),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: subjectSlug, medium, category: categorySlug, resource: resourceSlug } = await params;
  const data = await getData(subjectSlug, medium, categorySlug, resourceSlug);
  if (!data) return { title: "Not Found" };
  return { title: `${data.resource.title} | Commerce.lk` };
}

export default async function ResourcePage({ params }: Props) {
  const { subject: subjectSlug, medium, category: categorySlug, resource: resourceSlug } = await params;
  const data = await getData(subjectSlug, medium, categorySlug, resourceSlug);
  if (!data) notFound();

  const { resource, related } = data;
  const mediumLabel = MEDIUM_LABELS[medium] || medium;
  const pageUrl = `https://commerce.lk/${subjectSlug}/${medium}/${categorySlug}/${resourceSlug}`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pb-20">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-blue-100">
              <Link href="/" className="hover:text-white transition-colors text-blue-100">Home</Link>
              <ChevronRightIcon className="w-4 h-4 text-blue-300" />
              <Link href={`/${subjectSlug}`} className="hover:text-white transition-colors text-blue-100">{resource.subject?.name}</Link>
              <ChevronRightIcon className="w-4 h-4 text-blue-300" />
              <Link href={`/${subjectSlug}/${medium}`} className="hover:text-white transition-colors text-blue-100">{mediumLabel}</Link>
              <ChevronRightIcon className="w-4 h-4 text-blue-300" />
              <Link href={`/${subjectSlug}/${medium}/${categorySlug}`} className="hover:text-white transition-colors text-blue-100">{resource.category?.name}</Link>
            </nav>
          </div>
        </div>

        <AdBanner position="resource-top" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-0">
            {/* Left Content (70%) */}
            <div className="lg:col-span-8">
              {/* Header Info */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                    {resource.subject?.name}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-white text-xs font-bold uppercase tracking-wider">
                    {resource.category?.name}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                  {resource.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm py-4 px-5 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{formatDate(resource.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-5 h-5" />
                    <span>{resource.viewCount} Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>{resource.downloadCount} Downloads</span>
                  </div>
                </div>
              </div>

              {/* Resource Thumbnail */}
              <div className="bg-gray-900 rounded-3xl overflow-hidden mb-12 border border-gray-200 shadow-xl aspect-video relative">
                {resource.ogImage || resource.thumbnail ? (
                  <Image
                    src={resource.ogImage || resource.thumbnail}
                    alt={resource.title}
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <DocumentIcon className="w-32 h-32 text-gray-200" />
                  </div>
                )}
              </div>

              {/* Description */}
              {resource.description && (
                <div className="mb-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                  <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                    {resource.description}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mb-12">
                <TagPills tags={resource.tags || []} subjectSlug={subjectSlug} medium={medium} categorySlug={categorySlug} />
              </div>

              {/* Share & Report */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Share with friends</h3>
                  <ShareButtons title={resource.title} pageUrl={pageUrl} />
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-center items-center text-center">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Found a problem?</h3>
                  <p className="text-sm text-gray-500 mb-6">If the file is broken, incorrect, or missing pages, please let us know.</p>
                  <ReportButton slug={resourceSlug} title={resource.title} />
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
                <RatingSection slug={resourceSlug} />
              </div>
            </div>

            {/* Right Sidebar (30%) */}
            <aside className="lg:col-span-4">
              <div className="space-y-6 sticky top-24">
                {/* Download Card */}
                <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 shadow-lg">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                    Download Resource
                  </h3>
                  <div className="space-y-4">
                    <DownloadButton slug={resourceSlug} title={resource.title} pageUrl={pageUrl} />
                    <BookmarkButton resourceId={resource._id} />
                  </div>
                </div>

                <AdBanner position="resource-sidebar" />

                {/* Exam Countdown Card */}
                <div className="overflow-hidden rounded-3xl">
                   <ExamCountdown compact />
                </div>

                {/* Related Materials */}
                {related.length > 0 && (
                  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Related Materials</h3>
                    <RelatedResources resources={related} subjectSlug={subjectSlug} medium={medium} categorySlug={categorySlug} currentSlug={resourceSlug} />
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <AdBanner position="resource-bottom" />
      </main>
      <Footer />
    </>
  );
}
