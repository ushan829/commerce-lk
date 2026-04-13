import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-white flex items-center justify-center border-b border-gray-100">
        <div className="text-center px-4 py-16">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">404 — Not Found</p>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Page not found</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/"          className="btn-primary">Go to Home</Link>
            <Link href="/#subjects" className="btn-secondary">Browse Subjects</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
