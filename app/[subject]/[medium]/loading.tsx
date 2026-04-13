import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MediumLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb & Header Skeleton */}
        <div className="bg-gray-50 border-b border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              {[40, 4, 56, 4, 64].map((w, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: w }} />
              ))}
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-64 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded-lg w-96 animate-pulse" />
          </div>
        </div>

        {/* Categories List Skeleton */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-48" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 bg-gray-200 rounded w-12 mb-1 ml-auto" />
                    <div className="h-3 bg-gray-100 rounded w-16 ml-auto" />
                  </div>
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
