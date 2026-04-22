import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

const siteUrl = "https://silentfolio.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const publishedPosts = await prisma.post.findMany({
      where: {
        published: true,
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    const postEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...postEntries];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries:", error);
    return staticPages;
  }
}
