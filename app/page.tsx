import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SubjectsGrid from "@/components/home/SubjectsGrid";
import ExamCountdown from "@/components/home/ExamCountdown";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Resource from "@/models/Resource";
import User from "@/models/User";
import {
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import AdBanner from "@/components/ads/AdBanner";

export const metadata: Metadata = {
  title: "Commerce.lk | Free A/L Commerce Study Materials",
  description: "Download free A/L Commerce past papers, model papers, notes and more in Sinhala, Tamil and English.",
  alternates: { canonical: "/" },
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

export default async function HomePage() {
  const [subjects, siteStats] = await Promise.all([getSubjects(), getSiteStats()]);

  return (
    <>
      <Header />
      <main>
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

        {ExamCountdown && <ExamCountdown />}

        {/* Features Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Commerce.lk?</h2>
              <p className="text-gray-500">We are dedicated to providing the best study resources for Commerce students across Sri Lanka.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  {CurrencyDollarIcon && <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">100% Free</h3>
                <p className="text-gray-600 leading-relaxed">
                  No subscriptions, no hidden fees. Every single resource on our platform is free for everyone, forever.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  {GlobeAsiaAustraliaIcon && <GlobeAsiaAustraliaIcon className="w-8 h-8 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">All 3 Mediums</h3>
                <p className="text-gray-600 leading-relaxed">
                  We support Sinhala, Tamil, and English mediums, ensuring no student is left behind regardless of their language.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  {ShieldCheckIcon && <ShieldCheckIcon className="w-8 h-8 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Assured</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our team meticulously reviews every resource to ensure accuracy and relevance to the current A/L syllabus.
                </p>
              </div>
            </div>
          </div>
        </section>
        <AdBanner position="home-bottom" />
      </main>
      <Footer />
    </>
  );
}
