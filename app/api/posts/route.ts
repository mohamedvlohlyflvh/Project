import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

type SortOption = "latest" | "oldest" | "most-viewed";

type CreatePostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  categoryId?: string;
  readTime?: number;
  published?: boolean;
};

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function validateCreatePostInput(input: unknown):
  | { success: true; data: Required<Pick<CreatePostInput, "title" | "content">> & Omit<CreatePostInput, "title" | "content"> & { slug: string } }
  | { success: false; errors: string[] } {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: ["Invalid request body."],
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

  const providedSlug =
    typeof raw.slug === "string" && raw.slug.trim().length > 0
      ? normalizeSlug(raw.slug)
      : normalizeSlug(title);

  if (title.length < 5) {
    errors.push("Title must be at least 5 characters long.");
  }

  if (title.length > 180) {
    errors.push("Title must be 180 characters or fewer.");
  }

  if (content.length < 50) {
    errors.push("Content must be at least 50 characters long.");
  }

  if (!providedSlug) {
    errors.push("Slug is required.");
  }

  if (providedSlug.length > 120) {
    errors.push("Slug must be 120 characters or fewer.");
  }

  if (excerpt && excerpt.length > 320) {
    errors.push("Excerpt must be 320 characters or fewer.");
  }

  if (coverImage && !isValidHttpUrl(coverImage)) {
    errors.push("Cover image must be a valid HTTP or HTTPS URL.");
  }

  if (readTime < 1 || readTime > 120) {
    errors.push("Read time must be between 1 and 120 minutes.");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title,
      slug: providedSlug,
      excerpt,
      content,
      coverImage,
      categoryId,
      readTime,
      published,
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortParam = searchParams.get("sort");
    const sort: SortOption =
      sortParam === "oldest" || sortParam === "most-viewed" ? sortParam : "latest";

    const category = searchParams.get("category")?.trim();
    const limitParam = searchParams.get("limit");
    const limit =
      limitParam && Number.isFinite(Number(limitParam))
        ? Math.min(Math.max(Number(limitParam), 1), 50)
        : undefined;

    const orderBy =
      sort === "oldest"
        ? { publishedAt: "asc" as const }
        : sort === "most-viewed"
          ? { views: "desc" as const }
          : { publishedAt: "desc" as const };

    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...(category
          ? {
              category: {
                slug: category,
              },
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
        publishedAt: true,
        createdAt: true,
        views: true,
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
          },
        },
      },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as unknown;
    const validation = validateCreatePostInput(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid post data.",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const author = {
      id: currentUser.id,
      role: currentUser.role,
    };

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Selected category does not exist." },
          { status: 400 }
        );
      }
    }

    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this slug already exists." },
        { status: 409 }
      );
    }

    const now = new Date();

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        readTime: data.readTime,
        published: data.published,
        publishedAt: data.published ? now : null,
        authorId: author.id,
        categoryId: data.categoryId ?? null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}
