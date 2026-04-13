"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpenIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";
  const otpParam = searchParams.get("otp") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(otpParam);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Commerce<span className="text-blue-600">.lk</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-500 mt-2">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">Email Verified!</h3>
              <p className="text-gray-500 mt-1">Redirecting to your profile...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" required className="input" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="label">Verification Code</label>
                  <input
                    type="text" required className="input text-center text-2xl tracking-widest font-bold"
                    maxLength={6} placeholder="000000" value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Didn't receive the code?{" "}
                <Link href="/profile" className="text-blue-600 font-medium hover:underline">
                  Resend from profile
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Commerce.lk</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
