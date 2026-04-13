import Link from "next/link";

const SUBJECTS = [
  { name: "Accounting", slug: "accounting" },
  { name: "Business Studies", slug: "business-studies" },
  { name: "Economics", slug: "economics" },
  { name: "Business Statistics", slug: "business-statistics" },
  { name: "ICT", slug: "ict" },
  { name: "General English", slug: "general-english" },
  { name: "Common General Test", slug: "common-general-test" },
  { name: "GIT", slug: "git" },
];

const RESOURCES = [
  { name: "Past Papers", slug: "past-papers" },
  { name: "Model Papers", slug: "model-papers" },
  { name: "Short Notes", slug: "short-notes" },
  { name: "Marking Schemes", slug: "marking-schemes" },
  { name: "Term Test Papers", slug: "term-test-papers" },
];

const PLATFORM = [
  { name: "Search", href: "/search" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Request Material", href: "/requests" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.347-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.87 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.62 4.507-.955 6.169-.143.704-.283 1.44-.417 2.133-.091.49-.175.937-.247 1.335-.078.433-.147.789-.212 1.065-.094.395-.203.621-.411.761a1.03 1.03 0 01-.62.16c-.514 0-.926-.341-1.268-.666-.326-.312-.626-.653-.901-.986l-.711-.86c-.785-.95-1.457-1.761-2.23-2.169-.271-.143-.515-.29-.735-.419-.65-.381-1.32-.77-1.859-1.247a.55.55 0 01-.1-.142.33.33 0 01.03-.428 2.04 2.04 0 01.199-.189c.44-.383 1.036-.902 1.604-1.397.813-.71 1.641-1.433 2.261-2.139.33-.376.656-.75.951-1.12.922-1.159 1.635-2.054 2.395-3.122.056-.078.111-.156.165-.234.07-.1.155-.223.23-.31.068-.08.118-.114.175-.114z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo + description column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block text-2xl font-bold text-white mb-4">
              Commerce<span className="text-blue-500">.lk</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Sri Lanka&apos;s dedicated platform for A/L Commerce students. 
              Free access to past papers, notes, and study materials in all mediums.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors text-white"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors text-white"
              >
                <TelegramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Subjects column */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Subjects</h3>
            <ul className="space-y-3">
              {SUBJECTS.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}`} className="text-sm hover:text-white transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources column */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3 text-sm">
              {RESOURCES.map((r) => (
                <li key={r.slug}>
                  <Link href={`/search?category=${r.slug}`} className="hover:text-white transition-colors">
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform column */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3 text-sm">
              {PLATFORM.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="hover:text-white transition-colors">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Commerce.lk. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-xs hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs hover:text-white transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="text-xs hover:text-white transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
