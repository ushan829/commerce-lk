import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";
import {
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Commerce.lk team.',
};

const CHANNELS = [
  {
    title: "Resource Requests",
    desc: "Request materials not currently available on our platform.",
    Icon: ClipboardDocumentListIcon,
    href: "/requests",
    cta: "Request Form",
  },
  {
    title: "General Inquiries",
    desc: "Questions about the platform or partnership opportunities.",
    Icon: EnvelopeIcon,
    href: "mailto:hello@commerce.lk",
    cta: "Email Us",
  },
  {
    title: "Technical Support",
    desc: "Report issues with the website or your account.",
    Icon: ExclamationCircleIcon,
    href: "mailto:support@commerce.lk",
    cta: "Get Help",
  },
  {
    title: "Legal & Copyright",
    desc: "Inquiries regarding copyright or terms of service.",
    Icon: ShieldCheckIcon,
    href: "mailto:legal@commerce.lk",
    cta: "Contact Legal",
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-gray-50 border-b border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have a question or feedback? We'd love to hear from you. 
              Choose the right channel below for a faster response.
            </p>
          </div>
        </section>

        {/* Contact Channels */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {CHANNELS.map((channel) => (
                <div key={channel.title} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                    <channel.Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{channel.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-1">{channel.desc}</p>
                  <a href={channel.href} className="text-blue-600 font-bold hover:underline">
                    {channel.cta} &rarr;
                  </a>
                </div>
              ))}
            </div>

            {/* Form Section */}
            <div className="max-w-7xl mx-auto">
              <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Send us a message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
