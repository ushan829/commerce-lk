"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Users, 
  BookOpen, 
  Search 
} from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-100">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Sri Lanka&apos;s #1 Free A/L Commerce Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 max-w-4xl">
            Free study materials for every <span className="text-blue-600">student.</span>
          </h1>
          
          <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
            Past papers, model papers, short notes and marking schemes for
            A/L Commerce — in Sinhala, Tamil and English.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full max-w-2xl mb-8">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for resources, subjects or papers..."
                className="w-full pl-14 pr-32 py-4 sm:py-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-base sm:text-lg shadow-lg transition-all"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                <span className="hidden sm:inline">Search</span>
                <Search className="w-5 h-5 sm:hidden" />
              </button>
            </div>
          </form>

          <div className="text-gray-500 text-sm mb-12">
            Popular: <Link href="/accounting" className="text-blue-600 font-medium hover:underline">Accounting</Link> · <Link href="/economics" className="text-blue-600 font-medium hover:underline">Economics</Link> · <Link href="/business-studies" className="text-blue-600 font-medium hover:underline">Business Studies</Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-5xl">
            {[
              { value: stats.resourceCount, label: 'Resources', icon: <FileText className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { value: stats.totalDownloads, label: 'Downloads', icon: <Download className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
              { value: stats.userCount, label: 'Students', icon: <Users className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
              { value: stats.subjectCount, label: 'Subjects', icon: <BookOpen className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:border-blue-100 transition-colors">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  <CountUp end={stat.value} />
                </div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
