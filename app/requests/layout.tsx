import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Request Study Materials',
  description: 'Request specific A/L Commerce study materials from our team.',
};

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
