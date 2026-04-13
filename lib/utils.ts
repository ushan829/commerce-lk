import slugify from "slugify";

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const MEDIUMS = [
  { value: "sinhala", label: "Sinhala" },
  { value: "tamil", label: "Tamil" },
  { value: "english", label: "English" },
] as const;

export const DEFAULT_SUBJECTS = [
  { name: "Accounting",          slug: "accounting",           color: "#15803d", order: 1 },
  { name: "Business Studies",    slug: "business-studies",     color: "#b45309", order: 2 },
  { name: "Economics",           slug: "economics",            color: "#0d9488", order: 3 },
  { name: "Business Statistics", slug: "business-statistics",  color: "#7c3aed", order: 4 },
  { name: "ICT",                 slug: "ict",                  color: "#d97706", order: 5 },
  { name: "General English",     slug: "general-english",      color: "#0f766e", order: 6 },
  { name: "Common General Test", slug: "common-general-test",  color: "#166534", order: 7 },
  { name: "GIT",                 slug: "git",                  color: "#92400e", order: 8 },
];

export const DEFAULT_CATEGORIES = [
  { name: "Short Notes",          slug: "short-notes",          order: 1, isDefault: true },
  { name: "Model Papers",         slug: "model-papers",         order: 2, isDefault: true },
  { name: "Past Papers",          slug: "past-papers",          order: 3, isDefault: true },
  { name: "Marking Schemes",      slug: "marking-schemes",      order: 4, isDefault: true },
  {
    name: "1st Term Test Papers",
    slug: "1st-term-test-papers",
    order: 5,
    isDefault: true,
  },
  { name: "2nd Term Test Papers", slug: "2nd-term-test-papers", order: 6, isDefault: true },
  { name: "3rd Term Test Papers", slug: "3rd-term-test-papers", order: 7, isDefault: true },
];

export function generateSeoTitle(
  resource: string,
  category: string,
  subject: string,
  medium: string
): string {
  return `${resource} - ${category} | ${subject} (${medium}) | Commerce.lk`;
}

export function generateSeoDescription(
  resource: string,
  category: string,
  subject: string,
  medium: string
): string {
  return `Download ${resource} for A/L ${subject} in ${medium} medium. Free ${category} for Sri Lankan A/L Commerce students at Commerce.lk.`;
}
