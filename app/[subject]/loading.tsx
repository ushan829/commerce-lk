import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SubjectLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb & Header Skeleton */}
        <div className="bg-gray-50 border-b border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-64 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded-lg w-96 animate-pulse" />
          </div>
        </div>

        {/* Medium Selection Skeleton */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-10 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-pulse">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl mb-6" />
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded w-32" />
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-8" />
                  <div className="h-5 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
