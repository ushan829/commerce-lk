import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SubjectsGrid from "@/components/home/SubjectsGrid";
import ExamCountdown from "@/components/home/ExamCountdown";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Resource from "@/models/Resource";
import Category from "@/models/Category";
import User from "@/models/User";
import {
  Gift,
  Globe,
  ShieldCheck,
  ChevronRight,
  Download,
  Eye
} from "lucide-react";
import AdBanner from "@/components/ads/AdBanner";

export const metadata: Metadata = {
  title: 'Free A/L Commerce Study Materials for Sri Lankan Students',
  description: 'Download free A/L Accounting, Business Studies, Economics, ICT past papers, model papers, short notes and more.',
};

async function getSubjects() {
  try {
    await dbConnect();
    const subjects = await Subject.find({ isActive: true }).sort({ order: 1 }).lean();
    return subjects ? JSON.parse(JSON.stringify(subjects)) : [];
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
}

async function getSiteStats() {
  try {
    await dbConnect();
    const [resourceCount, userCount, downloadAgg] = await Promise.all([
      Resource.countDocuments({ isActive: true }).catch(() => 0),
      User.countDocuments({ isActive: true }).catch(() => 0),
      Resource.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: "$downloadCount" } } },
      ]).catch(() => []),
    ]);
    return {
      resourceCount: resourceCount || 0,
      userCount: userCount || 0,
      totalDownloads: (downloadAgg && downloadAgg[0]?.total) || 0,
    };
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return { resourceCount: 0, userCount: 0, totalDownloads: 0 };
  }
}

async function getRecentResources() {
  try {
    await dbConnect();
    // Register models for populate
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const s = Subject;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const c = Category;
    
    const resources = await Resource.find({ isActive: true })
      .populate('subject', 'name slug')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title slug subject medium category thumbnail downloadCount viewCount')
      .lean();
    return resources ? JSON.parse(JSON.stringify(resources)) : [];
  } catch (error) {
    console.error("Error fetching recent resources:", error);
    return [];
  }
}

export default async function HomePage() {
  const [subjects, siteStats, recentResources] = await Promise.all([
    getSubjects(),
    getSiteStats(),
    getRecentResources()
  ]);

  return (
    <>
      <Header />
      <main className="bg-gray-50">
        <AdBanner position="home-top" />
        {HeroSection && (
          <HeroSection
            stats={{
              ...siteStats,
              subjectCount: subjects.length,
            }}
          />
        )}

        {SubjectsGrid && <SubjectsGrid subjects={subjects} />}

        {/* Recently Added Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recently Added</h2>
              <p className="text-sm text-gray-500 mt-1">Latest study materials uploaded</p>
            </div>
            <Link href="/search" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResources.map((resource: any) => (
              <Link
                key={resource._id}
                href={`/${resource.subject?.slug}/${resource.medium}/${resource.category?.slug}/${resource.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {resource.thumbnail && (
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {resource.subject?.name}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
                      {resource.medium}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {resource.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {resource.downloadCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {resource.viewCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {ExamCountdown && <ExamCountdown />}

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Commerce.lk?</h2>
              <p className="text-gray-500">We are dedicated to providing the best study resources for Commerce students across Sri Lanka.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <Gift className="w-6 h-6 text-green-600" />,
                  title: '100% Free',
                  description: 'No hidden charges. Every single resource on our platform is free for everyone, forever.',
                  color: 'bg-green-50',
                  border: 'border-green-100',
                },
                {
                  icon: <Globe className="w-6 h-6 text-blue-600" />,
                  title: 'All 3 Mediums',
                  description: 'We support Sinhala, Tamil, and English mediums, ensuring no student is left behind.',
                  color: 'bg-blue-50',
                  border: 'border-blue-100',
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
                  title: 'Quality Assured',
                  description: 'Our team meticulously reviews each resource to ensure accuracy and relevance to the A/L syllabus.',
                  color: 'bg-purple-50',
                  border: 'border-purple-100',
                },
              ].map((feature) => (
                <div key={feature.title} className={`${feature.color} border ${feature.border} rounded-2xl p-6`}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <AdBanner position="home-bottom" />
      </main>
      <Footer />
    </>
  );
}
