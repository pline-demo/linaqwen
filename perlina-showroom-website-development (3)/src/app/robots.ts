import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://perlina.com.tr";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cmyonetim-x7p9/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
