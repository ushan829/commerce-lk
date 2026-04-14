import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Category from "@/models/Category";
import Resource from "@/models/Resource";

const BASE_URL = "https://commerce.lk";
const MEDIUMS = ["sinhala", "tamil", "english"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/requests`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    await dbConnect();

    const [subjects, categories, resources] = await Promise.all([
      Subject.find({ isActive: true }).select("slug updatedAt").lean(),
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
      Resource.find({ isActive: true })
        .populate("subject", "slug")
        .populate("category", "slug")
        .select("slug medium subject category updatedAt")
        .lean(),
    ]);

    const dynamicPages: MetadataRoute.Sitemap = [];

    // Subjects and Mediums
    for (const subject of subjects as any[]) {
      // /[subject]
      dynamicPages.push({
        url: `${BASE_URL}/${subject.slug}`,
        lastModified: subject.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });

      // /[subject]/[medium]
      for (const medium of MEDIUMS) {
        dynamicPages.push({
          url: `${BASE_URL}/${subject.slug}/${medium}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });

        // /[subject]/[medium]/[category]
        for (const category of categories as any[]) {
          dynamicPages.push({
            url: `${BASE_URL}/${subject.slug}/${medium}/${category.slug}`,
            lastModified: category.updatedAt || new Date(),
            changeFrequency: "daily",
            priority: 0.7,
          });
        }
      }
    }

    // Resources
    for (const resource of resources as any[]) {
      if (resource.subject?.slug && resource.category?.slug) {
        dynamicPages.push({
          url: `${BASE_URL}/${resource.subject.slug}/${resource.medium}/${resource.category.slug}/${resource.slug}`,
          lastModified: resource.updatedAt || new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    console.error("Sitemap error:", error);
    return staticPages;
  }
}
