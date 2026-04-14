import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/profile", "/_next/"],
      },
    ],
    sitemap: "https://commerce.lk/sitemap.xml",
    host: "https://commerce.lk",
  };
}
