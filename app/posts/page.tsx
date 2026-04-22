"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

type SortOption = "latest" | "oldest" | "most-viewed";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAuthorInitial(name: string | null | undefined) {
  return (name?.trim().charAt(0) || "A").toUpperCase();
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/posts?sort=${sortBy}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts.");
        }

        const data = (await response.json()) as PostItem[];

        if (!isCancelled) {
          setPosts(data);
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load posts."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      isCancelled = true;
    };
  }, [sortBy]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) => {
      const haystacks = [
        post.title,
        post.excerpt || "",
        post.category?.name || "",
        post.author?.name || "",
      ];

      return haystacks.some((value) => value.toLowerCase().includes(query));
    });
  }, [posts, searchQuery]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-40 md:px-12">
        <div className="flex min-h-100 items-center justify-center">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#e0e3e0]" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#545f6c] border-t-transparent" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-40 md:px-12">
      <section className="mb-24">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 block text-xs uppercase tracking-[0.2em] text-[#5c605d]">
              Our Journal
            </span>
            <h1 className="font-headline text-6xl italic tracking-tighter text-[#2f3331] md:text-8xl leading-[0.9]">
              The Collected Archive
            </h1>
          </div>

          <div className="flex w-full flex-col gap-6 md:min-w-100 md:w-auto">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full border-b border-[#afb3b0]/20 bg-transparent py-3 text-sm placeholder:text-[#afb3b0]/60 focus:border-[#545f6c] focus:outline-none"
                placeholder="Search the archives..."
                type="text"
              />
              <span className="material-symbols-outlined absolute right-0 top-3 text-xl text-[#afb3b0]">
                search
              </span>
            </div>

            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#5c605d]">
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                  className="cursor-pointer border-none bg-transparent font-medium text-[#2f3331] focus:outline-none"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most-viewed">Most Viewed</option>
                </select>
              </div>
              <span className="opacity-50">
                {filteredPosts.length} Entries Found
              </span>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-sm border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-red-700">
            Unable to Load Archive
          </p>
          <p className="mt-3 text-base text-red-600">{error}</p>
        </section>
      ) : filteredPosts.length === 0 ? (
        <section className="border border-[#afb3b0]/15 px-6 py-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
            No essays found
          </p>
          <p className="mt-4 text-lg leading-8 text-[#5c605d]">
            Try a different search term or change the archive sort order.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          {filteredPosts.map((post, index) => {
            const publishedLabel = formatDate(post.publishedAt || post.createdAt);

            if (index === 0) {
              return (
                <article key={post.id} className="col-span-12 group">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex flex-col items-center gap-12 md:flex-row"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-[#f3f4f1] md:w-7/12">
                      {post.coverImage ? (
                        <img
                          alt={post.title}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                          src={post.coverImage}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#f3f4f1] text-[#5c605d]">
                          No Cover Image
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-col md:w-5/12">
                      <div className="mb-6 flex items-center gap-4">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#545f6c]">
                          {post.category?.name || "Uncategorized"}
                        </span>
                        <span className="h-px w-8 bg-[#afb3b0]/30" />
                        <span className="text-xs uppercase tracking-widest text-[#5c605d]">
                          {post.readTime} Min Read
                        </span>
                      </div>

                      <h2 className="mb-6 font-headline text-4xl tracking-tight text-[#2f3331] transition-all duration-500 group-hover:italic md:text-5xl leading-tight">
                        {post.title}
                      </h2>

                      <p className="mb-8 max-w-md text-lg leading-relaxed text-[#5c605d]">
                        {post.excerpt || "A long-form essay from the Silent Folio archive."}
                      </p>

                      <div className="flex items-center justify-between">
                        <time className="text-[10px] uppercase tracking-[0.2em] text-[#afb3b0]">
                          {publishedLabel}
                        </time>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#afb3b0]">
                          {post.views} views
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            }

            return (
              <article
                key={post.id}
                className="col-span-12 flex flex-col group md:col-span-4"
              >
                <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
                  <div className="mb-8 aspect-4/5 overflow-hidden bg-[#f3f4f1]">
                    {post.coverImage ? (
                      <img
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        src={post.coverImage}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#f3f4f1] text-[#5c605d]">
                        No Cover Image
                      </div>
                    )}
                  </div>

                  {post.category ? (
                    <span className="mb-3 text-[10px] uppercase tracking-widest text-[#545f6c]">
                      {post.category.name}
                    </span>
                  ) : null}

                  <h2 className="mb-4 font-headline text-2xl tracking-tight text-[#2f3331] transition-colors group-hover:text-[#5c605d] leading-snug">
                    {post.title}
                  </h2>

                  <p className="line-clamp-2 text-sm leading-7 text-[#5c605d]">
                    {post.excerpt || "A long-form essay from the Silent Folio archive."}
                  </p>

                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-2 pb-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6e9e6] text-[10px] font-bold text-[#545f6c]">
                        {getAuthorInitial(post.author?.name)}
                      </div>
                      <span className="text-xs font-medium text-[#2f3331]">
                        By {post.author?.name || "Anonymous"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#afb3b0]/10 pt-4">
                      <time className="text-[10px] uppercase tracking-widest text-[#afb3b0]">
                        {publishedLabel}
                      </time>
                      <span className="text-[10px] uppercase tracking-widest text-[#afb3b0]">
                        {post.readTime} Min
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
