import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

type UpdatePostInput = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  categoryId?: string | null;
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

function sanitizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateUpdatePostInput(input: unknown):
  | {
      success: true;
      data: UpdatePostInput & {
        slug?: string;
      };
    }
  | {
      success: false;
      errors: string[];
    } {
  if (!input || typeof input !== "object") {
    return {
      success: false,
      errors: ["Invalid request body."],
    };
  }

  const raw = input as Record<string, unknown>;
  const errors: string[] = [];
  const data: UpdatePostInput & { slug?: string } = {};

  if ("title" in raw) {
    if (typeof raw.title !== "string") {
      errors.push("Title must be a string.");
    } else {
      const title = sanitizeText(raw.title);
      if (title.length < 5) {
        errors.push("Title must be at least 5 characters long.");
      } else if (title.length > 180) {
        errors.push("Title must be 180 characters or fewer.");
      } else {
        data.title = title;
      }
    }
  }

  if ("slug" in raw) {
    if (typeof raw.slug !== "string") {
      errors.push("Slug must be a string.");
    } else {
      const slug = normalizeSlug(raw.slug);
      if (!slug) {
        errors.push("Slug is required.");
      } else if (slug.length > 120) {
        errors.push("Slug must be 120 characters or fewer.");
      } else {
        data.slug = slug;
      }
    }
  }

  if ("excerpt" in raw) {
    if (raw.excerpt === null || raw.excerpt === "") {
      data.excerpt = null;
    } else if (typeof raw.excerpt !== "string") {
      errors.push("Excerpt must be a string.");
    } else if (raw.excerpt.trim().length > 320) {
      errors.push("Excerpt must be 320 characters or fewer.");
    } else {
      data.excerpt = raw.excerpt.trim();
    }
  }

  if ("content" in raw) {
    if (typeof raw.content !== "string") {
      errors.push("Content must be a string.");
    } else {
      const content = raw.content.trim();
      if (content.length < 50) {
        errors.push("Content must be at least 50 characters long.");
      } else {
        data.content = content;
      }
    }
  }

  if ("coverImage" in raw) {
    if (raw.coverImage === null || raw.coverImage === "") {
      data.coverImage = null;
    } else if (typeof raw.coverImage !== "string") {
      errors.push("Cover image must be a string.");
    } else if (!isValidHttpUrl(raw.coverImage.trim())) {
      errors.push("Cover image must be a valid HTTP or HTTPS URL.");
    } else {
      data.coverImage = raw.coverImage.trim();
    }
  }

  if ("categoryId" in raw) {
    if (raw.categoryId === null || raw.categoryId === "") {
      data.categoryId = null;
    } else if (typeof raw.categoryId !== "string") {
      errors.push("Category ID must be a string.");
    } else {
      data.categoryId = raw.categoryId.trim();
    }
  }

  if ("readTime" in raw) {
    let readTime: number | null = null;

    if (typeof raw.readTime === "number" && Number.isFinite(raw.readTime)) {
      readTime = Math.floor(raw.readTime);
    } else if (typeof raw.readTime === "string" && raw.readTime.trim() !== "") {
      const parsed = Number(raw.readTime);
      if (Number.isFinite(parsed)) {
        readTime = Math.floor(parsed);
      }
    }

    if (readTime === null) {
      errors.push("Read time must be a valid number.");
    } else if (readTime < 1 || readTime > 120) {
      errors.push("Read time must be between 1 and 120 minutes.");
    } else {
      data.readTime = readTime;
    }
  }

  if ("published" in raw) {
    if (typeof raw.published !== "boolean") {
      errors.push("Published must be a boolean.");
    } else {
      data.published = raw.published;
    }
  }

  if (Object.keys(data).length === 0 && errors.length === 0) {
    errors.push("No valid fields were provided to update.");
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data,
  };
}

async function getAuthenticatedAuthor() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    role: user.role,
  };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const author = await getAuthenticatedAuthor();

    if (!author) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        authorId: true,
        published: true,
        publishedAt: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    const isOwner = existingPost.authorId === author.id;
    const isAdmin = author.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You are not allowed to update this post." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as unknown;
    const validation = validateUpdatePostInput(body);

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

    if (data.slug && data.slug !== existingPost.slug) {
      const duplicateSlug = await prisma.post.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { error: "A post with this slug already exists." },
          { status: 409 }
        );
      }
    }

    const shouldPublishNow = data.published === true && !existingPost.published;
    const shouldUnpublish = data.published === false && existingPost.published;

    const updatedPost = await prisma.post.update({
      where: { id: existingPost.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.coverImage !== undefined ? { coverImage: data.coverImage } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.readTime !== undefined ? { readTime: data.readTime } : {}),
        ...(data.published !== undefined ? { published: data.published } : {}),
        ...(shouldPublishNow
          ? { publishedAt: new Date() }
          : shouldUnpublish
            ? { publishedAt: null }
            : {}),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        readTime: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: "Failed to update post." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const author = await getAuthenticatedAuthor();

    if (!author) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    const isOwner = existingPost.authorId === author.id;
    const isAdmin = author.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You are not allowed to delete this post." },
        { status: 403 }
      );
    }

    await prisma.comment.deleteMany({
      where: { postId: existingPost.id },
    });

    await prisma.post.delete({
      where: { id: existingPost.id },
    });

    return NextResponse.json(
      { success: true, id: existingPost.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 }
    );
  }
}
