import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-utils";
import { getDashboardSummary, getPostsByAuthorId } from "@/lib/posts";

function formatDate(value: Date | string | null) {
  if (!value) {
    return "Draft";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const metadata = {
  title: "Dashboard | Silent Folio",
  description:
    "Manage your essays, drafts, and editorial activity from the Silent Folio dashboard.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const [summary, posts] = await Promise.all([
    getDashboardSummary(user.id),
    getPostsByAuthorId(user.id),
  ]);

  const recentPosts = posts.slice(0, 8);

  return (
    <main className="mx-auto max-w-7xl px-6 py-32 md:px-12">
      <header className="mb-12 flex flex-col gap-8 border-b border-[#afb3b0]/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#5c605d]">
            Editorial Dashboard
          </p>
          <h1 className="text-4xl font-headline italic text-[#2f3331] md:text-6xl">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#5c605d]">
            Review your latest essays, keep drafts moving, and return to the
            archive with a clear editorial overview.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/CreatePost"
            className="inline-flex items-center justify-center bg-[#545f6c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-[#485460]"
          >
            New Post
          </Link>
          <Link
            href="/posts"
            className="inline-flex items-center justify-center border border-[#afb3b0]/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#5c605d] transition-all duration-300 hover:border-[#545f6c]/30 hover:bg-[#f3f4f1] hover:text-[#2f3331]"
          >
            View Archive
          </Link>
        </div>
      </header>

      <section className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-[#afb3b0]/15 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
            Total Posts
          </p>
          <p className="mt-4 text-4xl font-headline italic text-[#2f3331]">
            {summary.posts}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#5c605d]">
            The complete number of essays currently assigned to your byline.
          </p>
        </div>

        <div className="border border-[#afb3b0]/15 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
            Published
          </p>
          <p className="mt-4 text-4xl font-headline italic text-[#2f3331]">
            {summary.publishedPosts}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#5c605d]">
            Essays currently visible in the public editorial archive.
          </p>
        </div>

        <div className="border border-[#afb3b0]/15 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
            Drafts
          </p>
          <p className="mt-4 text-4xl font-headline italic text-[#2f3331]">
            {summary.drafts}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#5c605d]">
            Working pieces waiting for revision, polish, or publication.
          </p>
        </div>

        <div className="border border-[#afb3b0]/15 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
            Comments Received
          </p>
          <p className="mt-4 text-4xl font-headline italic text-[#2f3331]">
            {summary.commentsReceived}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#5c605d]">
            Reader contributions posted across your published essays.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border border-[#afb3b0]/15 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#afb3b0]/15 px-6 py-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
                Your Recent Posts
              </p>
              <h2 className="mt-3 text-3xl font-headline italic text-[#2f3331]">
                Editorial Queue
              </h2>
            </div>

            <Link
              href="/CreatePost"
              className="text-xs uppercase tracking-[0.22em] text-[#545f6c] transition-colors duration-300 hover:text-[#2f3331]"
            >
              Create Another Essay
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="px-6 py-12">
              <p className="text-lg leading-8 text-[#5c605d]">
                You have not created any posts yet. Start with a new draft and
                build your first entry in the archive.
              </p>

              <div className="mt-8">
                <Link
                  href="/CreatePost"
                  className="inline-flex items-center justify-center bg-[#545f6c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-[#485460]"
                >
                  Create Your First Post
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#afb3b0]/10">
              {recentPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col gap-6 px-6 py-6 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
                      <span
                        className={`px-3 py-1 ${
                          post.published
                            ? "bg-[#f3f4f1] text-[#545f6c]"
                            : "bg-[#f3ece6] text-[#7b5c43]"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>

                      {post.category?.name ? (
                        <>
                          <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
                          <span>{post.category.name}</span>
                        </>
                      ) : null}

                      <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
                      <span>{post.readTime} min read</span>

                      <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
                      <span>{post.views} views</span>

                      <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
                      <span>{post._count.comments} comments</span>
                    </div>

                    <h3 className="text-2xl leading-snug text-[#2f3331]">
                      <span className="font-headline italic">{post.title}</span>
                    </h3>

                    {post.excerpt ? (
                      <p className="mt-3 max-w-3xl text-base leading-8 text-[#5c605d]">
                        {post.excerpt}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-[#5c605d]">
                      <span>
                        {post.published
                          ? `Published ${formatDate(post.publishedAt)}`
                          : `Updated ${formatDate(post.updatedAt)}`}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
                      <span>Slug: {post.slug}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="inline-flex items-center justify-center border border-[#afb3b0]/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5c605d] transition-all duration-300 hover:border-[#545f6c]/30 hover:bg-[#f3f4f1] hover:text-[#2f3331]"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="inline-flex items-center justify-center bg-[#545f6c] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#485460]"
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="border border-[#afb3b0]/15 bg-[#f3f4f1] p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
              Workflow Notes
            </p>
            <div className="mt-5 space-y-5 text-sm leading-7 text-[#5c605d]">
              <p>
                Keep drafts unpublished until the excerpt, slug, and cover image
                are complete.
              </p>
              <p>
                Prefer concise titles and clear opening paragraphs for better
                archive readability and social previews.
              </p>
              <p>
                Review comments regularly to keep the editorial dialogue alive.
              </p>
            </div>
          </div>

          <div className="border border-[#afb3b0]/15 bg-white p-6 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
              Quick Links
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/CreatePost"
                className="text-sm text-[#545f6c] transition-colors duration-300 hover:text-[#2f3331]"
              >
                Create a new post
              </Link>
              <Link
                href="/categories"
                className="text-sm text-[#545f6c] transition-colors duration-300 hover:text-[#2f3331]"
              >
                Browse categories
              </Link>

              <Link
                href="/posts"
                className="text-sm text-[#545f6c] transition-colors duration-300 hover:text-[#2f3331]"
              >
                Visit public essays page
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
