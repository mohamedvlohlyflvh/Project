/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import CommentsSection, {
  type CommentItem,
} from "@/app/components/comments/CommentsSection";
import {
  getCommentTreeByPostId,
  getPostBySlug,
  incrementPostViews,
  parseContentToBlocks,
} from "@/lib/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function createAvatarFallback(name: string | null | undefined) {
  const safeName = name?.trim() || "Anonymous Author";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    safeName
  )}&background=545f6c&color=fff&bold=true`;
}

function serializeComments(
  comments: Awaited<ReturnType<typeof getCommentTreeByPostId>>
): CommentItem[] {
  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
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
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested essay could not be found in the archive.",
    };
  }

  const title = `${post.title} | Silent Folio`;
  const description =
    post.excerpt?.trim() ||
    post.content.trim().slice(0, 160) ||
    "A long-form essay from the Silent Folio archive.";

  return {
    title,
    description,
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/posts/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : [],
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function SlugPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, session, freshComments] = await Promise.all([
    getPostBySlug(slug),
    auth(),
    getPostBySlug(slug).then(async (result) => {
      if (!result) return [];
      return getCommentTreeByPostId(result.id);
    }),
  ]);

  if (!post || !post.published) {
    notFound();
  }

  incrementPostViews(post.id).catch(() => {
    // non-blocking analytics update
  });

  const blocks = parseContentToBlocks(post.content);
  const publishedDate = post.publishedAt ?? post.createdAt;
  const authorName = post.author?.name || "Anonymous";
  const authorImage = post.author?.image || createAvatarFallback(post.author?.name);
  const categoryName = post.category?.name || "Uncategorized";
  const tags = [categoryName, "Editorial Archive", "Long Form"];
  const introParagraph =
    blocks.find((block) => block.type === "paragraph")?.text || post.excerpt || "";

  const initialComments = serializeComments(freshComments);
  const isSignedIn = Boolean(session.userId);

  return (
    <main className="bg-[#faf9f7] pt-32 pb-24 text-[#2f3331]">
      <article className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="mb-12">
          <Link
            href="/posts"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-[#5c605d] transition-all duration-300 hover:text-[#2f3331]"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Essays
          </Link>
        </div>

        <header className="mb-16 border-b border-[#afb3b0]/15 pb-12">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#5c605d]">
            <span className="bg-[#f3f4f1] px-3 py-1.5 text-[#545f6c]">{categoryName}</span>
            <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
            <span>{post.readTime} min read</span>
            <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
            <time>{formatDate(publishedDate)}</time>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <h1 className="mb-6 max-w-4xl text-4xl leading-tight tracking-tight md:text-6xl lg:text-7xl">
                <span className="font-headline italic">{post.title}</span>
              </h1>

              {post.excerpt && (
                <p className="max-w-3xl text-lg leading-8 text-[#5c605d] md:text-xl">
                  {post.excerpt}
                </p>
              )}
            </div>

            <aside className="border border-[#afb3b0]/15 bg-[#f3f4f1] p-5">
              <div className="flex items-center gap-4">
                <img
                  src={authorImage}
                  alt={authorName}
                  className="h-14 w-14 rounded-full object-cover grayscale"
                />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c605d]">
                    Written by
                  </p>
                  <p className="mt-1 text-base font-medium text-[#2f3331]">{authorName}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#afb3b0]/15 pt-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c605d]">
                  Published
                </p>
                <p className="mt-2 text-sm leading-6 text-[#2f3331]">
                  {formatDate(publishedDate)}
                </p>
              </div>

              <div className="mt-5 border-t border-[#afb3b0]/15 pt-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c605d]">
                  Views
                </p>
                <p className="mt-2 text-sm leading-6 text-[#2f3331]">
                  {post.views.toLocaleString("en-US")}
                </p>
              </div>
            </aside>
          </div>
        </header>

        {post.coverImage && (
          <figure className="mb-16 overflow-hidden rounded-sm bg-[#f3f4f1]">
            <div className="aspect-16/8 w-full">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover grayscale-[0.1]"
              />
            </div>
            <figcaption className="border-t border-[#afb3b0]/15 px-5 py-4 text-sm italic text-[#5c605d] md:px-6">
              Featured image for {post.title}
            </figcaption>
          </figure>
        )}

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            {introParagraph && !post.excerpt && (
              <p className="mb-10 max-w-3xl text-xl leading-9 text-[#5c605d] md:text-2xl">
                {introParagraph}
              </p>
            )}

            <div className="max-w-3xl space-y-8">
              {blocks.length > 0 ? (
                blocks.map((block, index) => {
                  if (block.type === "heading") {
                    return (
                      <h2
                        key={block.id}
                        className="pt-8 text-3xl leading-tight text-[#2f3331] md:text-4xl"
                      >
                        <span className="font-headline italic">{block.text}</span>
                      </h2>
                    );
                  }

                  if (block.type === "quote") {
                    return (
                      <blockquote
                        key={block.id}
                        className="border-l-2 border-[#545f6c] pl-6 md:pl-8"
                      >
                        <p className="font-headline text-2xl italic leading-10 text-[#2f3331] md:text-3xl">
                          “{block.text}”
                        </p>
                      </blockquote>
                    );
                  }

                  if (block.type === "list") {
                    return (
                      <ul
                        key={block.id}
                        className="list-disc space-y-4 pl-6 text-lg leading-8 text-[#2f3331] marker:text-[#545f6c]"
                      >
                        {block.items.map((item) => (
                          <li key={`${block.id}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p
                      key={block.id}
                      className={`text-lg leading-9 text-[#2f3331] md:text-[1.15rem] ${
                        index === 0 ? "serif-dropcap" : ""
                      }`}
                    >
                      {block.text}
                    </p>
                  );
                })
              ) : (
                <p className="text-lg leading-9 text-[#2f3331]">
                  This essay has not been published with body content yet.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-8 lg:pt-2">
            <div className="border border-[#afb3b0]/15 bg-[#f3f4f1] p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
                Article Notes
              </p>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
                    Category
                  </p>
                  <p className="mt-2 text-base text-[#2f3331]">{categoryName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
                    Reading Time
                  </p>
                  <p className="mt-2 text-base text-[#2f3331]">{post.readTime} minutes</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
                    Archive
                  </p>
                  <p className="mt-2 text-base italic text-[#2f3331]">
                    Silent Folio Editorial Collection
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-[#afb3b0]/15 p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
                Tagged
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/categories?tag=${encodeURIComponent(tag)}`}
                    className="border border-[#afb3b0]/20 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#545f6c] transition-all duration-300 hover:border-[#545f6c]/35 hover:bg-[#f3f4f1] hover:text-[#2f3331]"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <CommentsSection
          postSlug={post.slug}
          initialComments={initialComments}
          isSignedIn={isSignedIn}
        />
      </article>
    </main>
  );
}
