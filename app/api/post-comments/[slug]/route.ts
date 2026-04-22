import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

type CreateCommentInput = {
  content?: string;
  parentId?: string | null;
};

function sanitizeContent(value: string): string {
  return value.trim().replace(/\r\n/g, "\n");
}

type SerializedComment = {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  replies: SerializedComment[];
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });

    if (!post || !post.published) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id,
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

    const serializedComments: SerializedComment[] = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId,
      author: comment.author
        ? {
            id: comment.author.id,
            name: comment.author.name,
            image: comment.author.image,
          }
        : null,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        parentId: reply.parentId,
        author: reply.author
          ? {
              id: reply.author.id,
              name: reply.author.name,
              image: reply.author.image,
            }
          : null,
        replies: [],
      })),
    }));

    return NextResponse.json(serializedComments, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch comments by post slug:", error);

    return NextResponse.json(
      { error: "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to comment." },
        { status: 401 }
      );
    }

    const { slug } = await context.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });

    if (!post || !post.published) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Authenticated user is not provisioned in the database." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateCommentInput;
    const content =
      typeof body.content === "string" ? sanitizeContent(body.content) : "";
    const parentId =
      typeof body.parentId === "string" && body.parentId.trim().length > 0
        ? body.parentId.trim()
        : null;

    if (content.length < 2) {
      return NextResponse.json(
        { error: "Comment must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (content.length > 3000) {
      return NextResponse.json(
        { error: "Comment must be 3000 characters or fewer." },
        { status: 400 }
      );
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true },
      });

      if (!parentComment || parentComment.postId !== post.id) {
        return NextResponse.json(
          { error: "Parent comment is invalid." },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: dbUser.id,
        postId: post.id,
        parentId,
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
    });

    const serializedComment: SerializedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId,
      author: comment.author
        ? {
            id: comment.author.id,
            name: comment.author.name,
            image: comment.author.image,
          }
        : null,
      replies: [],
    };

    return NextResponse.json({ comment: serializedComment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment by post slug:", error);

    return NextResponse.json(
      { error: "Failed to create comment." },
      { status: 500 }
    );
  }
}
