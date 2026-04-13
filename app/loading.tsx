import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HomeLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero skeleton */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-8 animate-pulse">
                <div className="h-6 bg-blue-50 rounded-full w-48" />
                <div className="space-y-4">
                  <div className="h-16 bg-gray-100 rounded-2xl w-full" />
                  <div className="h-16 bg-gray-100 rounded-2xl w-3/4" />
                </div>
                <div className="h-6 bg-gray-50 rounded-lg w-2/3" />
                <div className="h-16 bg-gray-100 rounded-2xl w-full max-w-2xl" />
              </div>
              <div className="hidden lg:block lg:col-span-5">
                <div className="aspect-square bg-blue-50 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stats bar skeleton */}
          <div className="border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="py-12 px-6">
                    <div className="h-10 bg-gray-100 rounded-lg w-20 mb-2" />
                    <div className="h-4 bg-gray-50 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subjects skeleton */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-32" />
              <div className="h-6 bg-gray-100 rounded-lg w-24" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-8 bg-white border border-gray-100 rounded-2xl animate-pulse shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl mb-6" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
