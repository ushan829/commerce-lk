import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Commerce.lk",
  description:
    "Privacy Policy for Commerce.lk. Learn what personal data we collect, how it is used, and your rights over that data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const sections = [
    {
      id: "overview",
      heading: "Overview",
      content: (
        <>
          <p>
            This Privacy Policy describes what personal data Commerce.lk collects, how it is used,
            and the choices you have regarding that data. We have written this policy to be direct
            and readable — not to obscure anything behind legal complexity.
          </p>
          <p>
            By using this platform you agree to the practices described here. If you do not agree,
            please do not use the platform.
          </p>
        </>
      ),
    },
    {
      id: "data-collected",
      heading: "Data We Collect",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Account registration</h3>
            <p>
              When you create an account, we collect your name, email address, and a password
              (stored as a one-way cryptographic hash — we never store your password in plain text).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Optional profile information</h3>
            <p>
              You may choose to provide additional details — phone number, school name, district,
              medium of instruction, A/L year, gender, and date of birth. These fields are entirely
              optional. They are used only to personalise your experience on the platform.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Activity data</h3>
            <p>
              If you are signed in, we record your download history (up to 200 entries) and the
              resources you bookmark. This data powers your profile page and is not used for any
              other purpose.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Usage data</h3>
            <p>
              Like all web servers, ours logs basic request data — IP address, browser type, pages
              visited, and timestamps. This data is used to maintain and improve the platform and
              is not linked to your account.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "data-use",
      heading: "How We Use Your Data",
      content: (
        <>
          <p>We use the data we collect to:</p>
          <ul className="space-y-2 pl-4">
            {[
              "Authenticate your account and maintain your session",
              "Display your profile information, download history, and bookmarks",
              "Send transactional emails — account verification and password resets",
              "Send optional notification emails if you have opted in (new resources, exam reminders)",
              "Calculate download counts and ratings displayed on resource pages",
              "Improve the platform based on aggregate usage patterns",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="pt-2">
            We do not use your data for advertising targeting, profiling, or any purpose not listed
            above.
          </p>
        </>
      ),
    },
    {
      id: "data-sharing",
      heading: "Data Sharing",
      content: (
        <>
          <p>
            We do not sell, rent, or share your personal data with third parties for their
            commercial purposes.
          </p>
          <p>
            Your data may be processed by the following categories of service provider, strictly
            as necessary to operate the platform:
          </p>
          <ul className="space-y-2 pl-4">
            {[
              "Cloud infrastructure providers (hosting the application and database)",
              "File storage providers (hosting downloadable PDFs)",
              "Email delivery providers (sending account-related emails)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            These providers process data only on our instructions and are not permitted to use it
            for their own purposes.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      heading: "Cookies",
      content: (
        <>
          <p>We use the following cookies:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700 w-1/4">Cookie</th>
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700 w-1/4">Type</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">next-auth.session-token</td>
                  <td className="py-3 pr-4">Authentication</td>
                  <td className="py-3">Maintains your login session. Expires after 30 days or on sign-out.</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">next-auth.csrf-token</td>
                  <td className="py-3 pr-4">Security</td>
                  <td className="py-3">Protects against cross-site request forgery. Session duration.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We do not use advertising cookies or third-party tracking cookies that follow you
            across websites. Display advertisements shown on the platform may set their own
            cookies, governed by the respective advertiser&apos;s privacy policy.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      heading: "Data Retention",
      content: (
        <>
          <p>
            We retain your personal data for as long as your account is active. If you delete your
            account, your personal data — name, email, profile information, download history, and
            bookmarks — is permanently deleted from our database. Anonymised aggregate data (e.g.
            total download counts per resource) may be retained.
          </p>
          <p>
            Server access logs are retained for up to 90 days for security and diagnostic purposes.
          </p>
        </>
      ),
    },
    {
      id: "your-rights",
      heading: "Your Rights",
      content: (
        <>
          <p>You have the right to:</p>
          <ul className="space-y-2 pl-4">
            {[
              "Access the personal data we hold about you",
              "Correct inaccurate data through your profile settings",
              "Delete your account and all associated data",
              "Withdraw consent for optional notification emails at any time from your profile settings",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            To exercise any of these rights, use the settings in your{" "}
            <Link href="/profile" className="text-blue-600 hover:underline font-medium">
              profile page
            </Link>{" "}
            or write to{" "}
            <a href="mailto:hello@commerce.lk" className="text-blue-600 hover:underline font-medium">
              hello@commerce.lk
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "security",
      heading: "Security",
      content: (
        <p>
          Passwords are hashed using bcrypt with a work factor of 12 before storage. Connections to
          the platform are encrypted via TLS. We apply standard security practices throughout the
          application. No system is perfectly secure, and we cannot guarantee that a breach will
          never occur, but we take reasonable and proportionate measures to protect your data.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Changes to This Policy",
      content: (
        <p>
          We may update this policy from time to time. When we do, the &ldquo;last updated&rdquo;
          date at the top of this page will change. For significant changes, we will notify
          registered users by email. Continued use of the platform after a change constitutes
          acceptance of the updated policy.
        </p>
      ),
    },
    {
      id: "contact",
      heading: "Contact",
      content: (
        <p>
          For privacy-related questions or requests, write to{" "}
          <a href="mailto:hello@commerce.lk" className="text-blue-600 hover:underline font-medium">
            hello@commerce.lk
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="bg-white min-h-screen">
        {/* Page hero section */}
        <section className="bg-gray-50 border-b border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Learn what personal data we collect, how it is used, and your rights over that data.
            </p>
          </div>
        </section>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.heading}
                </h2>
                <div className="text-gray-600 leading-relaxed space-y-4">
                  {section.content}
                </div>
                <div className="mt-12 border-b border-gray-100" />
              </section>
            ))}

            <div className="flex gap-4 text-sm text-gray-500">
              <Link href="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
              <span>•</span>
              <Link href="/disclaimer" className="text-blue-600 hover:underline font-medium">Disclaimer</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
