import { prisma } from "@/lib/prisma";

export type PostListItem = Awaited<ReturnType<typeof getPublishedPosts>>[number];
export type PostBySlug = Awaited<ReturnType<typeof getPostBySlug>>;
export type DashboardPostListItem = Awaited<
  ReturnType<typeof getPostsByAuthorId>
>[number];
export type PostCommentTree = Awaited<
  ReturnType<typeof getCommentTreeByPostId>
>;

export async function getPublishedPosts(options?: {
  limit?: number;
  sort?: "latest" | "oldest" | "most-viewed";
  categorySlug?: string;
  search?: string;
}) {
  const limit = options?.limit
    ? Math.min(Math.max(options.limit, 1), 50)
    : undefined;

  const sort = options?.sort ?? "latest";
  const search = options?.search?.trim();

  const orderBy =
    sort === "oldest"
      ? { publishedAt: "asc" as const }
      : sort === "most-viewed"
        ? { views: "desc" as const }
        : { publishedAt: "desc" as const };

  return prisma.post.findMany({
    where: {
      published: true,
      ...(options?.categorySlug
        ? {
            category: {
              slug: options.categorySlug,
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                excerpt: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                content: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy,
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      readTime: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      views: true,
      authorId: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  });
}

export async function getPostByIdForEdit(id: string, authorId?: string) {
  return prisma.post.findFirst({
    where: {
      id,
      ...(authorId ? { authorId } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      readTime: true,
      published: true,
      publishedAt: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function getPostsByAuthorId(authorId: string) {
  return prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      readTime: true,
      views: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}

export async function getDashboardSummary(authorId: string) {
  const [posts, publishedPosts, drafts, commentsReceived] = await Promise.all([
    prisma.post.count({
      where: { authorId },
    }),
    prisma.post.count({
      where: {
        authorId,
        published: true,
      },
    }),
    prisma.post.count({
      where: {
        authorId,
        published: false,
      },
    }),
    prisma.comment.count({
      where: {
        post: {
          authorId,
        },
      },
    }),
  ]);

  return {
    posts,
    publishedPosts,
    drafts,
    commentsReceived,
  };
}

export async function getCategoriesWithCounts() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          posts: {
            where: {
              published: true,
            },
          },
        },
      },
      posts: {
        where: {
          published: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          publishedAt: true,
          createdAt: true,
          readTime: true,
        },
      },
    },
  });
}

export async function getCommentTreeByPostId(postId: string) {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      replies: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return comments;
}

export async function incrementPostViews(postId: string) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      views: {
        increment: 1,
      },
    },
    select: {
      id: true,
      views: true,
    },
  });
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sanitizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type CreateOrUpdatePostInput = {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  categoryId?: string | null;
  readTime?: number | string | null;
  published?: boolean;
};

export type PostValidationResult =
  | {
      success: true;
      data: {
        title: string;
        slug: string;
        excerpt?: string;
        content: string;
        coverImage?: string;
        categoryId?: string;
        readTime: number;
        published: boolean;
      };
    }
  | {
      success: false;
      errors: string[];
      fieldErrors: Record<string, string>;
    };

export function validatePostInput(
  input: unknown
): PostValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};

  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: ["Invalid request body."],
      fieldErrors: {
        form: "Invalid request body.",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  const title = typeof raw.title === "string" ? sanitizeText(raw.title) : "";
  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  const excerpt =
    typeof raw.excerpt === "string" && raw.excerpt.trim().length > 0
      ? raw.excerpt.trim()
      : undefined;
  const coverImage =
    typeof raw.coverImage === "string" && raw.coverImage.trim().length > 0
      ? raw.coverImage.trim()
      : undefined;
  const categoryId =
    typeof raw.categoryId === "string" && raw.categoryId.trim().length > 0
      ? raw.categoryId.trim()
      : undefined;
  const published = typeof raw.published === "boolean" ? raw.published : false;

  let readTime = 5;
  if (typeof raw.readTime === "number" && Number.isFinite(raw.readTime)) {
    readTime = Math.floor(raw.readTime);
  } else if (typeof raw.readTime === "string" && raw.readTime.trim() !== "") {
    const parsed = Number(raw.readTime);
    if (Number.isFinite(parsed)) {
      readTime = Math.floor(parsed);
    }
  }

  const slug =
    typeof raw.slug === "string" && raw.slug.trim().length > 0
      ? normalizeSlug(raw.slug)
      : normalizeSlug(title);

  if (title.length < 5) {
    const message = "Title must be at least 5 characters long.";
    errors.push(message);
    fieldErrors.title = message;
  }

  if (title.length > 180) {
    const message = "Title must be 180 characters or fewer.";
    errors.push(message);
    fieldErrors.title = message;
  }

  if (content.length < 50) {
    const message = "Content must be at least 50 characters long.";
    errors.push(message);
    fieldErrors.content = message;
  }

  if (!slug) {
    const message = "Slug is required.";
    errors.push(message);
    fieldErrors.slug = message;
  }

  if (slug.length > 120) {
    const message = "Slug must be 120 characters or fewer.";
    errors.push(message);
    fieldErrors.slug = message;
  }

  if (excerpt && excerpt.length > 320) {
    const message = "Excerpt must be 320 characters or fewer.";
    errors.push(message);
    fieldErrors.excerpt = message;
  }

  if (coverImage && !isValidHttpUrl(coverImage)) {
    const message = "Cover image must be a valid HTTP or HTTPS URL.";
    errors.push(message);
    fieldErrors.coverImage = message;
  }

  if (readTime < 1 || readTime > 120) {
    const message = "Read time must be between 1 and 120 minutes.";
    errors.push(message);
    fieldErrors.readTime = message;
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      categoryId,
      readTime,
      published,
    },
  };
}

export function parseContentToBlocks(content: string | null) {
  if (!content) {
    return [];
  }

  const sections = content
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section, index) => {
    if (section.startsWith("## ")) {
      return {
        id: `heading-${index}`,
        type: "heading" as const,
        text: section.replace(/^##\s+/, "").trim(),
      };
    }

    if (section.startsWith("> ")) {
      return {
        id: `quote-${index}`,
        type: "quote" as const,
        text: section.replace(/^>\s+/, "").trim(),
      };
    }

    if (
      section
        .split("\n")
        .some((line) => line.trim().startsWith("- "))
    ) {
      return {
        id: `list-${index}`,
        type: "list" as const,
        items: section
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("- "))
          .map((line) => line.replace(/^-+\s*/, "").trim())
          .filter(Boolean),
      };
    }

    return {
      id: `paragraph-${index}`,
      type: "paragraph" as const,
      text: section,
    };
  });
}
