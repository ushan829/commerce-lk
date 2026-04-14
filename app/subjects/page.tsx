import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SubjectsGrid from "@/components/home/SubjectsGrid";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Subjects',
  description: 'Browse all A/L Commerce subjects and download free study materials.',
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

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Page hero section */}
        <section className="bg-gray-50 border-b border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Browse by Subject
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Select a subject to explore available past papers, model papers, and short notes in all three mediums.
            </p>
          </div>
        </section>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <SubjectsGrid subjects={subjects} />
        </div>
      </main>
      <Footer />
    </>
  );
}
