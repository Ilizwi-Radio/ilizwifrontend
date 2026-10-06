import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.ilizwiradio.co.za",
      lastModified: new Date(),
      priority: 1,
    },
  ];
}