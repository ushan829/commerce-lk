"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export interface HeroStats {
  resourceCount: number;
  totalDownloads: number;
  userCount: number;
  subjectCount: number;
}

const CountUp = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = end / 60;
    const t = setInterval(() => {
      v += step;
      if (v >= end) {
        setCount(end);
        clearInterval(t);
      } else setCount(Math.floor(v));
    }, 24);
    return () => clearInterval(t);
  }, [end]);
  
  if (end >= 1000) return <>{(end / 1000).toFixed(1)}K+</>;
  return <>{count}+</>;
};

export default function HeroSection({ stats }: { stats: HeroStats }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left side (60%) */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-8">
              🇱🇰 Sri Lanka · A/L Commerce Platform
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
              Free study materials<br />
              for every student.
            </h1>
            
            <p className="text-xl text-gray-500 max-w-lg mb-10 leading-relaxed">
              Past papers, model papers, short notes and marking schemes for
              A/L Commerce — in Sinhala, Tamil and English.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for resources..."
                className="w-full pl-6 pr-32 py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg shadow-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>Search</span>
              </button>
            </form>

            <div className="text-gray-500 text-sm">
              or <Link href="#subjects" className="text-blue-600 font-semibold hover:underline">browse by subject</Link> · <Link href="/register" className="text-gray-900 font-semibold hover:underline">register free</Link>
            </div>
          </div>

          {/* Right side (40%) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-blue-50 rounded-full scale-90 -z-10 blur-3xl opacity-50" />
            <div className="relative aspect-square max-w-md mx-auto">
              <img
                src="/Home Page.svg"
                alt="Commerce.lk Illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {[
              { label: "Resources", value: stats.resourceCount },
              { label: "Downloads", value: stats.totalDownloads },
              { label: "Students", value: stats.userCount },
              { label: "Subjects", value: stats.subjectCount },
            ].map((stat, idx) => (
              <div key={stat.label} className="py-12 px-6 text-center md:text-left">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  <CountUp end={stat.value} />
                </div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
