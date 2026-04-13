import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ResourceLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-20">
        {/* Breadcrumb Skeleton */}
        <div className="bg-gray-50 border-b border-gray-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              {[40, 4, 56, 4, 64, 4, 72, 4, 96].map((w, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Content (70%) */}
            <div className="lg:col-span-8">
              <div className="mb-8 animate-pulse">
                <div className="flex gap-2 mb-6">
                  <div className="h-6 w-20 bg-blue-50 rounded-full" />
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-3/4 mb-6" />
                <div className="flex gap-6 pb-8 border-b border-gray-100">
                  <div className="h-5 w-32 bg-gray-100 rounded" />
                  <div className="h-5 w-32 bg-gray-100 rounded" />
                  <div className="h-5 w-32 bg-gray-100 rounded" />
                </div>
              </div>

              {/* Thumbnail Skeleton */}
              <div className="bg-gray-50 rounded-3xl aspect-video mb-12 animate-pulse" />

              {/* Description Skeleton */}
              <div className="space-y-4 mb-12 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-40 mb-6" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>

            {/* Right Sidebar (30%) */}
            <aside className="lg:col-span-4">
              <div className="space-y-6">
                <div className="h-64 bg-white border border-gray-100 rounded-3xl p-8 animate-pulse shadow-sm" />
                <div className="h-40 bg-blue-600 rounded-3xl p-8 animate-pulse" />
                <div className="h-96 bg-white border border-gray-100 rounded-3xl p-8 animate-pulse shadow-sm" />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
