import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ilizwiradio.co.za",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://ilizwiradio.co.za/about",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://ilizwiradio.co.za/contact",
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}