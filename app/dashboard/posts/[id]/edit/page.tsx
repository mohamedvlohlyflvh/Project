import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

import EditPostForm from "./EditPostForm";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Post",
  description: "Update an existing Silent Folio post from the editorial dashboard.",
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const { id } = await params;

  const post = await prisma.post.findFirst({
    where: {
      id,
      ...(user.role === "ADMIN" ? {} : { authorId: user.id }),
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
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-32">
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#5c605d] transition-colors duration-300 hover:text-[#2f3331]"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>

      <header className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#5c605d]">
          Editorial Workspace
        </p>
        <h1 className="mb-4 text-4xl font-headline italic text-[#2f3331] md:text-5xl">
          Edit Post
        </h1>
        <p className="text-lg leading-8 text-[#5c605d]">
          Refine your article, update metadata, and control publication status
          from the dashboard.
        </p>
      </header>

      <section className="mb-8 grid gap-4 rounded-xl border border-[#afb3b0]/15 bg-[#f3f4f1] p-5 md:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
            Status
          </p>
          <p className="mt-2 text-base text-[#2f3331]">
            {post.published ? "Published" : "Draft"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
            Category
          </p>
          <p className="mt-2 text-base text-[#2f3331]">
            {post.category?.name || "Uncategorized"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
            Last Updated
          </p>
          <p className="mt-2 text-base text-[#2f3331]">
            {new Date(post.updatedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      <div className="border border-[#afb3b0]/15 bg-white p-6 shadow-sm md:p-8">
        <EditPostForm
          postId={post.id}
          initialData={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            readTime: post.readTime,
            published: post.published,
            categoryId: post.categoryId,
          }}
          categories={categories}
        />
      </div>
    </main>
  );
}
