import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Search Study Materials',
  description: 'Search through thousands of free A/L Commerce study materials.',
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
