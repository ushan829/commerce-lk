import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Commerce.lk",
  description:
    "Answers to common questions about Commerce.lk — what the platform offers, how to download resources, accounts, and where the materials come from.",
  alternates: { canonical: "/faq" },
};

interface FAQItem {
  q: string;
  a: React.ReactNode;
}

const SECTIONS: { id: string; label: string; icon: any; items: FAQItem[] }[] = [
  {
    id: "general",
    label: "General",
    icon: QuestionMarkCircleIcon,
    items: [
      {
        q: "What is Commerce.lk?",
        a: "Commerce.lk is a free online library of study materials for students sitting the Sri Lankan Advanced Level (A/L) Commerce stream. It collects past papers, model papers, marking schemes, short notes, and term test papers from all subjects in the Commerce stream and makes them available in Sinhala, Tamil, and English medium.",
      },
      {
        q: "Is Commerce.lk officially affiliated with the Department of Education or the Department of Examinations?",
        a: "No. Commerce.lk is an independent platform. We are not affiliated with, endorsed by, or partnered with the Department of Education, the Department of Examinations, or any other government body. The materials we host are sourced from publicly distributed government examination documents and school-issued papers.",
      },
      {
        q: "How is the platform funded?",
        a: "Running costs are covered by display advertising shown on the site. All study resources remain free — no fees are charged, and no premium tier exists.",
      },
      {
        q: "How often are new resources added?",
        a: "New materials are added as they become available — typically after each A/L examination cycle or when schools release their term test papers. If a resource you need is missing, you can submit a request through the resource request form.",
      },
    ],
  },
  {
    id: "resources",
    label: "Resources & Downloads",
    icon: ArrowDownTrayIcon,
    items: [
      {
        q: "Are all resources free to download?",
        a: "Yes, without exception. Every PDF on this platform can be downloaded at no cost. There are no locked files, no payment steps, and no time limits.",
      },
      {
        q: "Do I need an account to download?",
        a: "No. You can browse and download resources without registering. Creating a free account is optional — it allows you to bookmark resources, track your download history, and save your preferences.",
      },
      {
        q: "What file format are the resources in?",
        a: "All resources are PDF files. You will need a PDF viewer to open them — most smartphones and computers include one by default.",
      },
      {
        q: "Where do the past papers and term test papers come from?",
        a: (
          <>
            Past papers are sourced from the Department of Examinations, which publishes official A/L examination papers each year. Term test papers are collected from government schools across Sri Lanka. These are publicly distributed documents used widely for revision. For more detail, see our{" "}
            <Link href="/disclaimer" className="text-blue-600 hover:underline font-medium">
              Disclaimer
            </Link>
            .
          </>
        ),
      },
      {
        q: "Can I request a resource that is not on the site?",
        a: (
          <>
            Yes. Use the{" "}
            <Link href="/requests" className="text-blue-600 hover:underline font-medium">
              resource request form
            </Link>{" "}
            to submit a request. We review all requests and upload materials when we are able to source them.
          </>
        ),
      },
      {
        q: "A file I downloaded appears to be corrupt or incomplete. What should I do?",
        a: (
          <>
            Submit a report through the{" "}
            <Link href="/requests" className="text-blue-600 hover:underline font-medium">
              resource request form
            </Link>{" "}
            and include the name of the file. We will review and replace it.
          </>
        ),
      },
    ],
  },
  {
    id: "account",
    label: "Accounts",
    icon: UserCircleIcon,
    items: [
      {
        q: "Is registration free?",
        a: "Yes. Creating an account is free and will remain so. We do not offer a paid account tier.",
      },
      {
        q: "What information do I need to provide to register?",
        a: "Only a name, email address, and password are required. Additional profile fields — school, district, medium, A/L year — are optional and used only to personalise your experience.",
      },
      {
        q: "How do I delete my account?",
        a: (
          <>
            Go to your{" "}
            <Link href="/profile" className="text-blue-600 hover:underline font-medium">
              profile page
            </Link>
            , open the Settings tab, and scroll to the Danger Zone section. You can permanently delete your account there. This action cannot be undone.
          </>
        ),
      },
      {
        q: "Will my download history or bookmarks be shared with anyone?",
        a: "No. Your activity data is used only to power your profile features — download history, bookmarks, and recommendations. It is not sold, rented, or shared with third parties.",
      },
    ],
  },
  {
    id: "legal",
    label: "Legal & Privacy",
    icon: ShieldCheckIcon,
    items: [
      {
        q: "Can I use these materials for teaching or tutoring?",
        a: "The materials on this platform are sourced from publicly distributed educational documents. Using them for non-commercial educational purposes — private study, classroom teaching, or tutoring — is consistent with how they are intended to be used. Redistribution for commercial gain is not permitted.",
      },
      {
        q: "What cookies does Commerce.lk use?",
        a: "We use a session cookie for authentication (if you are logged in) and standard analytics. We do not use tracking cookies that follow you across other websites. See the Privacy Policy for full details.",
      },
      {
        q: "I have a legal concern about a specific file. Who should I contact?",
        a: (
          <>
            Write to{" "}
            <a href="mailto:hello@commerce.lk" className="text-blue-600 hover:underline font-medium">
              hello@commerce.lk
            </a>{" "}
            with the details. We take content concerns seriously and will respond promptly.
          </>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="bg-white min-h-screen">
        {/* Page hero section */}
        <section className="bg-gray-50 border-b border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Answers to the most common questions about the platform, its resources, and how accounts work.
            </p>
          </div>
        </section>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto space-y-16">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.label}</h2>
                </div>

                <div className="space-y-6">
                  {section.items.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">{item.q}</h3>
                      <div className="text-gray-600 leading-relaxed">{item.a}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Still have questions */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have a question?</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                If your question is not covered above, reach out directly. For resource-related
                issues, the request form is the fastest path.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/requests" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                  Resource Request Form
                </Link>
                <a href="mailto:hello@commerce.lk" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
