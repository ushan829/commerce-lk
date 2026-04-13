import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import Resource from "@/models/Resource";

const MEDIUMS = ["sinhala", "tamil", "english"];
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://commerce.lk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await dbConnect();

    const [subjects, categories, resources] = await Promise.all([
      Subject.find({ isActive: true }).lean(),
      Category.find({ isActive: true }).lean(),
      Resource.find({ isActive: true })
        .populate("subject", "slug")
        .populate("category", "slug")
        .select("slug medium subject category updatedAt")
        .lean(),
    ]);

    const urls: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${BASE_URL}/login`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${BASE_URL}/register`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
    ];

    // Subject pages
    for (const subject of subjects as unknown as { slug: string; updatedAt?: Date }[]) {
      urls.push({
        url: `${BASE_URL}/${subject.slug}`,
        lastModified: subject.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });

      // Medium pages
      for (const medium of MEDIUMS) {
        urls.push({
          url: `${BASE_URL}/${subject.slug}/${medium}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });

        // Category pages
        for (const category of categories as unknown as { slug: string }[]) {
          urls.push({
            url: `${BASE_URL}/${subject.slug}/${medium}/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
          });
        }
      }
    }

    // Resource pages
    for (const resource of resources as unknown as {
      slug: string;
      medium: string;
      subject: { slug: string };
      category: { slug: string };
      updatedAt?: Date;
    }[]) {
      if (resource.subject?.slug && resource.category?.slug) {
        urls.push({
          url: `${BASE_URL}/${resource.subject.slug}/${resource.medium}/${resource.category.slug}/${resource.slug}`,
          lastModified: resource.updatedAt || new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }

    return urls;
  } catch {
    return [{ url: BASE_URL, lastModified: new Date(), priority: 1 }];
  }
}
