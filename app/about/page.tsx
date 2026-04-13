import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "About — Commerce.lk",
  description: "Learn more about Commerce.lk and our mission to provide free study materials for A/L students.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gray-50 border-b border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Our Mission</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We believe every student in Sri Lanka deserves equal access to quality education. 
              Commerce.lk is our contribution to making that a reality.
            </p>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  <CurrencyDollarIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Always Free</h3>
                <p className="text-gray-600">No subscriptions, no hidden fees. Our resources are and will always be 100% free.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  <GlobeAsiaAustraliaIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Inclusive</h3>
                <p className="text-gray-600">We support Sinhala, Tamil, and English mediums to serve all Sri Lankan students.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  <ShieldCheckIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quality First</h3>
                <p className="text-gray-600">All materials are reviewed by experts to ensure they meet the latest A/L syllabus standards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm">
               <h2 className="text-3xl font-bold text-gray-900 mb-8">Bridging the Gap</h2>
               <div className="prose prose-blue max-w-none text-gray-600 space-y-6 text-lg">
                  <p>
                    Commerce.lk was created to close the gap between students at well-resourced schools and
                    those without access to quality revision materials. Past papers, marking schemes, and
                    model answers have always existed — but they were scattered, hard to find, or locked
                    behind paid services.
                  </p>
                  <p>
                    This platform collects, organises, and publishes those materials in one place, free of
                    charge. The focus is on the A/L Commerce stream: Accounting, Business Studies,
                    Economics, and the related subjects that sit alongside them.
                  </p>
               </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
