import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Disclaimer — Commerce.lk",
  description:
    "Disclaimer for Commerce.lk regarding the sourcing and use of educational materials, including past papers and term test papers from the Department of Education and government schools.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  const sections = [
    {
      id: "intro",
      heading: "Introduction",
      content: (
        <p>
          Commerce.lk is an independent, free-to-use educational resource platform serving
          students preparing for the Sri Lankan Advanced Level (A/L) Commerce stream
          examinations. This disclaimer explains the nature of the materials hosted on this
          platform and the basis on which they are published.
        </p>
      ),
    },
    {
      id: "source",
      heading: "Source of Materials",
      content: (
        <>
          <p>
            The study materials hosted on Commerce.lk are obtained from two principal sources:
          </p>
          <ol className="list-decimal list-inside space-y-4 pl-2">
            <li>
              <span className="font-semibold text-gray-800">The Department of Examinations, Sri Lanka</span>
              <p className="mt-2 pl-5">
                Official A/L past papers and marking schemes issued by the Department of Examinations
                are publicly distributed documents. After each examination cycle, these papers
                circulate widely among students, teachers, and tuition centres across the country.
                We collect and republish them in an organised, searchable format to make access
                consistent for all students.
              </p>
            </li>
            <li>
              <span className="font-semibold text-gray-800">Government Schools</span>
              <p className="mt-2 pl-5">
                Term test papers — first, second, and third term examination papers — are produced
                and distributed by individual government schools throughout Sri Lanka. These papers
                are routinely shared between schools, tuition centres, and students as part of
                normal educational practice. We source them through the same channels and publish
                them here to extend that access to all students, regardless of which school they
                attend.
              </p>
            </li>
          </ol>
          <p>
            In some cases, model papers and short notes are prepared by educators and contributed
            to the platform specifically for publication here.
          </p>
        </>
      ),
    },
    {
      id: "educational-purpose",
      heading: "Educational Purpose",
      content: (
        <>
          <p>
            All materials on this platform are published solely for educational purposes. The
            intent is to support the academic preparation of A/L Commerce students — in
            particular, students who may not have access to the same resources as those attending
            well-resourced schools or private tuition institutions.
          </p>
          <p>
            Past papers and term test papers are among the most effective tools for examination
            preparation. Practising with real papers under timed conditions, and studying official
            marking schemes to understand how marks are allocated, is widely recognised as essential
            preparation for the A/L examination. Making these materials freely and uniformly
            accessible is the primary motivation for this platform.
          </p>
          <blockquote className="border-l-4 border-blue-400 pl-5 py-1 mt-6">
            <p className="font-medium text-gray-700 italic leading-relaxed">
              &ldquo;Access to good study materials should not be determined by geography, school
              resources, or financial means. Commerce.lk exists to close that gap.&rdquo;
            </p>
          </blockquote>
        </>
      ),
    },
    {
      id: "no-affiliation",
      heading: "No Official Affiliation",
      content: (
        <p>
          Commerce.lk is not affiliated with, endorsed by, or operating under the authority of
          the Department of Examinations, the Ministry of Education, or any other government
          department or institution. The use of terms such as &ldquo;Department of Education
          papers&rdquo; or &ldquo;government school papers&rdquo; describes only the origin of
          the materials, not any formal relationship between this platform and those bodies.
        </p>
      ),
    },
    {
      id: "accuracy",
      heading: "Accuracy of Materials",
      content: (
        <p>
          We make reasonable efforts to ensure that files hosted on this platform are complete,
          legible, and correctly categorised. However, we cannot guarantee the accuracy or
          completeness of every document. Students should verify important information — such as
          mark allocations or answer keys — against official sources where precision is critical.
        </p>
      ),
    },
    {
      id: "removal-requests",
      heading: "Content Removal Requests",
      content: (
        <>
          <p className="mb-5">
            If you are a rights holder and believe that a specific resource on this platform
            should not be published, please contact us with the following information:
          </p>
          <ul className="space-y-2 text-sm pl-4">
            {[
              "The name and URL of the resource in question",
              "Your name and contact details",
              "A description of your rights over the material",
              "The action you are requesting",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5">
            We will acknowledge your request within 24 hours and take appropriate action. Write
            to{" "}
            <a href="mailto:legal@commerce.lk" className="text-blue-600 hover:underline font-medium">
              legal@commerce.lk
            </a>
            .
          </p>
        </>
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
              Disclaimer
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Important information regarding the sourcing and use of educational materials on this platform.
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
              <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
