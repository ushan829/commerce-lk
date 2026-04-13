import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CategoryLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb & Header Skeleton */}
        <div className="bg-gray-50 border-b border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              {[40, 4, 56, 4, 64, 4, 72].map((w, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: w }} />
              ))}
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-64 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded-lg w-96 animate-pulse" />
          </div>
        </div>

        {/* Resource Grid Skeleton */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-video bg-gray-100" />
                  <div className="p-6">
                    <div className="flex gap-2 mb-3">
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-full mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-6" />
                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                    </div>
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
