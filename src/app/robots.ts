import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth", "/dashboard/"],
    },
    sitemap: "https://www.ilizwiradio.co.za/sitemap.xml",
  };
}
