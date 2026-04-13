import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Commerce.lk",
  description:
    "Terms of Service for Commerce.lk. Read the terms that govern your use of the platform and its resources.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      heading: "Acceptance of Terms",
      content: (
        <p>
          By accessing or using Commerce.lk, you agree to be bound by these Terms of Service and
          our{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>.
          If you do not agree to these terms, do not use the platform. These terms apply to all
          visitors, registered users, and any other parties who access the platform.
        </p>
      ),
    },
    {
      id: "service",
      heading: "Description of Service",
      content: (
        <>
          <p>
            Commerce.lk provides a free online library of educational study materials for students
            preparing for the Sri Lankan Advanced Level Commerce stream examination. Resources
            include past papers, model papers, marking schemes, short notes, and term test papers.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue the platform or any part of it
            at any time, with or without notice. We will not be liable to you or any third party
            for any such modification, suspension, or discontinuation.
          </p>
        </>
      ),
    },
    {
      id: "accounts",
      heading: "Accounts",
      content: (
        <>
          <p>
            Creating an account is free and optional. You do not need an account to browse or
            download resources.
          </p>
          <p>
            If you create an account, you are responsible for maintaining the confidentiality of
            your password and for all activity that occurs under your account. You must notify us
            immediately at{" "}
            <a href="mailto:hello@commerce.lk" className="text-blue-600 hover:underline font-medium">
              hello@commerce.lk
            </a>{" "}
            if you become aware of any unauthorised use of your account.
          </p>
          <p>
            You must provide accurate information when registering. Accounts created with false
            information may be terminated.
          </p>
        </>
      ),
    },
    {
      id: "permitted-use",
      heading: "Permitted Use",
      content: (
        <>
          <p>You may use Commerce.lk for the following purposes:</p>
          <ul className="space-y-2 pl-4">
            {[
              "Personal study and examination preparation",
              "Use in a classroom or teaching setting for non-commercial educational purposes",
              "Sharing individual resources with other students for their personal study",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "prohibited-use",
      heading: "Prohibited Use",
      content: (
        <>
          <p>You may not use Commerce.lk for any of the following:</p>
          <ul className="space-y-2 pl-4">
            {[
              "Redistribution or resale of downloaded materials for commercial gain",
              "Bulk automated downloading of resources (scraping)",
              "Creating a competing service using materials obtained from this platform",
              "Any use that violates applicable Sri Lankan law",
              "Attempting to gain unauthorised access to any part of the platform or its infrastructure",
              "Submitting false or misleading information in resource requests or contact forms",
              "Uploading or transmitting any harmful, unlawful, or infringing content",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "intellectual-property",
      heading: "Intellectual Property",
      content: (
        <>
          <p>
            The original design, code, and written content of Commerce.lk (excluding the study
            materials themselves) are the property of Commerce.lk and are protected by applicable
            intellectual property laws. You may not reproduce, distribute, or create derivative
            works from this original content without written permission.
          </p>
          <p>
            Study materials hosted on this platform — including past papers, term test papers, and
            marking schemes — are sourced from publicly distributed government examination documents
            and school-issued papers. We do not claim ownership of these materials. For information
            on the sourcing of these documents, see our{" "}
            <Link href="/disclaimer" className="text-blue-600 hover:underline font-medium">Disclaimer</Link>.
          </p>
          <p>
            If you believe that any content on this platform infringes your intellectual property
            rights, contact us at{" "}
            <a href="mailto:legal@commerce.lk" className="text-blue-600 hover:underline font-medium">
              legal@commerce.lk
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "disclaimers",
      heading: "Disclaimers & Limitation of Liability",
      content: (
        <>
          <p>
            The platform and its resources are provided &ldquo;as is&rdquo; without warranty of
            any kind, express or implied. We do not warrant that the platform will be available at
            all times, that files will be complete or error-free, or that the content is accurate
            or up to date.
          </p>
          <p>
            To the fullest extent permitted by law, Commerce.lk shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your use of the
            platform, including but not limited to reliance on any materials downloaded from the
            platform for examination purposes.
          </p>
          <p>
            Students are advised to cross-reference materials against official sources and the
            current examination syllabus.
          </p>
        </>
      ),
    },
    {
      id: "termination",
      heading: "Account Termination",
      content: (
        <>
          <p>
            You may delete your account at any time from the Settings tab in your profile. On
            deletion, all your personal data is permanently removed.
          </p>
          <p>
            We reserve the right to suspend or terminate any account that violates these terms,
            without prior notice. Resources on the platform remain accessible to all visitors
            regardless of account status.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      heading: "Governing Law",
      content: (
        <p>
          These terms are governed by and construed in accordance with the laws of Sri Lanka.
          Any disputes arising from or relating to these terms or your use of the platform shall
          be subject to the exclusive jurisdiction of the courts of Sri Lanka.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Changes to These Terms",
      content: (
        <p>
          We may update these terms from time to time. The &ldquo;last updated&rdquo; date at the
          top of this page reflects the most recent revision. Continued use of the platform after
          changes have been posted constitutes your acceptance of the revised terms. For
          significant changes, we will notify registered users by email.
        </p>
      ),
    },
    {
      id: "contact",
      heading: "Contact",
      content: (
        <p>
          Questions about these terms should be directed to{" "}
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
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Read the terms that govern your use of the platform and its resources.
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
              <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
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
