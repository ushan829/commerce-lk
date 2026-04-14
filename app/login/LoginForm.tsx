"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState({ text: "", type: "" });
  const [error, setError] = useState(urlError === "EMAIL_NOT_VERIFIED" ? "EMAIL_NOT_VERIFIED" : "");

  const handleResendVerification = async () => {
    if (!form.email) return;
    setResendLoading(true);
    setResendMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMessage({ text: "Verification email sent! Check your inbox.", type: "success" });
      } else if (res.status === 429) {
        setResendMessage({ text: "Please wait a moment before trying again.", type: "error" });
      } else {
        setResendMessage({ text: data.message || data.error || "Failed to resend email.", type: "error" });
      }
    } catch {
      setResendMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendMessage({ text: "", type: "" });

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error === "EMAIL_NOT_VERIFIED" || res.error.includes("EMAIL_NOT_VERIFIED")) {
        setError("EMAIL_NOT_VERIFIED");
      } else if (res.error.startsWith("ACCOUNT_LOCKED")) {
        const minutes = res.error.split(":")[1] || "15";
        setError(`ACCOUNT_LOCKED:${minutes}`);
      } else if (res.error.startsWith("INVALID_CREDENTIALS")) {
        const count = parseInt(res.error.split(":")[1] || "0");
        if (count >= 3) {
          setError(`INVALID_CREDENTIALS:${count}`);
        } else {
          setError("Incorrect email or password. Please try again.");
        }
      } else {
        setError("Incorrect email or password. Please try again.");
      }
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center p-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-lg">
          <Link href="/" className="inline-block mb-16 text-3xl font-bold text-white tracking-tight">
            Commerce.lk
          </Link>

          <h2 className="text-5xl font-bold text-white leading-tight mb-12">
            The future of <br />
            <span className="text-blue-100 italic">A/L Excellence.</span>
          </h2>

          <div className="space-y-6">
            {[
              "Access 5,000+ premium study materials",
              "Track your download history",
              "Bookmark resources for offline study",
              "Request custom materials from experts",
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white">
        <div className="max-w-md w-full">
          <div className="mb-12">
             <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome back</h1>
             <p className="text-lg text-gray-500">Sign in to continue your journey.</p>
          </div>

          {error === "EMAIL_NOT_VERIFIED" ? (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <p className="text-yellow-800 font-bold text-sm">Please verify your email address to continue.</p>
              <p className="text-yellow-700 text-sm mt-1 font-medium">Check your inbox for the verification link.</p>
              
              {resendMessage.text ? (
                <p className={`mt-4 text-sm font-bold ${resendMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {resendMessage.text}
                </p>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-bold underline disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
              )}
            </div>
          ) : error.startsWith("ACCOUNT_LOCKED") ? (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-red-800 font-bold text-sm">
                Account temporarily locked due to too many failed attempts.
              </p>
              <p className="text-red-600 text-sm mt-1 font-medium">
                Please try again in {error.split(":")[1] || "15"} minutes or reset your password.
              </p>
              <Link href="/forgot-password" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-bold underline">
                Reset your password
              </Link>
            </div>
          ) : error.startsWith("INVALID_CREDENTIALS") ? (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
              <p>Incorrect email or password. Please try again.</p>
              <p className="text-xs mt-1 text-red-500 font-medium italic">
                Warning: {error.split(":")[1]} failed attempts. Account will be locked after 5 failed attempts.
              </p>
            </div>
          ) : error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="name@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-2"
                >
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-500 font-medium">
              New here?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline ml-1">
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
