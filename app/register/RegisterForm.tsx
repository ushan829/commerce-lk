"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { SL_DISTRICTS } from "@/lib/profileCompletion";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    phone: "", school: "", district: "", medium: "", 
    alYear: "", gender: "", dateOfBirth: "", stream: "",
  });
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: any) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await signIn("credentials", { email: form.email, password: form.password, redirect: false });
        router.push("/profile");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="inline-block mb-16 text-3xl font-bold text-white tracking-tight">
            Commerce.lk
          </Link>
          <h2 className="text-5xl font-bold text-white leading-tight mb-12">
            Join the <br />
            <span className="text-blue-100 italic">Winners Circle.</span>
          </h2>
          <div className="space-y-6">
            {[
              "Personalized study dashboards",
              "Exclusive mock exam papers",
              "Direct support from top educators",
              "Join 10,000+ active students",
            ].map((text) => (
              <div key={text} className="flex items-center gap-4 text-lg font-medium text-blue-50">
                <CheckCircleIcon className="w-6 h-6 text-blue-300 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="max-w-xl w-full">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Account</h1>
            <p className="text-lg text-gray-500">Free forever. No credit card required.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Full Name</label>
                <input required type="text" value={form.name} onChange={set("name")} placeholder="John Doe"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Email Address</label>
                <input required type="email" value={form.email} onChange={set("email")} placeholder="john@example.com"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Password</label>
                <input required type="password" value={form.password} onChange={set("password")} placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Confirm Password</label>
                <input required type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>

            <button type="button" onClick={() => setShowOptional(!showOptional)} className="flex items-center justify-between w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
               <span>Add educational details (Recommended)</span>
               <ChevronDownIcon className={`w-5 h-5 transition-transform ${showOptional ? "rotate-180" : ""}`} />
            </button>

            {showOptional && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">School Name</label>
                    <input type="text" value={form.school} onChange={set("school")} placeholder="e.g. Royal College, Colombo"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">District</label>
                    <select value={form.district} onChange={set("district")} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                       <option value="">Select District</option>
                       {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Medium</label>
                    <select value={form.medium} onChange={set("medium")} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                       <option value="">Select Medium</option>
                       <option value="sinhala">Sinhala</option>
                       <option value="tamil">Tamil</option>
                       <option value="english">English</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">A/L Year</label>
                    <select value={form.alYear} onChange={set("alYear")} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                       <option value="">Select Year</option>
                       {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Gender</label>
                    <select value={form.gender} onChange={set("gender")} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                       <option value="">Select Gender</option>
                       <option value="male">Male</option>
                       <option value="female">Female</option>
                       <option value="other">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Date of Birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Subject Stream</label>
                    <select 
                      value={form.stream} 
                      onChange={set("stream")} 
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Select Subject Combination</option>
                      <option value="Accounting, Business Studies, Economics">Accounting + Business Studies + Economics</option>
                      <option value="Accounting, Business Studies, Business Statistics">Accounting + Business Studies + Business Statistics</option>
                      <option value="Accounting, Business Studies, ICT">Accounting + Business Studies + ICT</option>
                      <option value="Accounting, Economics, Business Statistics">Accounting + Economics + Business Statistics</option>
                      <option value="Accounting, Economics, ICT">Accounting + Economics + ICT</option>
                      <option value="Accounting, Business Statistics, ICT">Accounting + Business Statistics + ICT</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? "Creating Account..." : "Create My Free Account"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-500 font-medium">
              Already a member?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline ml-1">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
