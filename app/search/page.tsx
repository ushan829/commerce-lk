"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      doSearch(query);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Search Header */}
        <section className="bg-gray-50 border-b border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Search Resources</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Find exactly what you need for your A/L Commerce studies.
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, subject, or year..."
                className="w-full pl-14 pr-32 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg shadow-sm transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : searched ? (
              <div className="space-y-4">
                <p className="text-gray-500 mb-8 font-medium">Found {results.length} results for "{query}"</p>
                {results.map((r) => (
                  <a
                    key={r._id}
                    href={`/${r.subject.slug}/${r.medium}/${r.category.slug}/${r.slug}`}
                    className="flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <DocumentIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{r.title}</h3>
                      <div className="flex gap-2">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{r.subject.name}</span>
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">•</span>
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest capitalize">{r.medium}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{r.downloadCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{r.viewCount}</span>
                      </div>
                    </div>
                  </a>
                ))}
                {results.length === 0 && (
                   <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">No resources found matching your search.</p>
                   </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg font-medium">Enter a keyword above to start searching.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}
