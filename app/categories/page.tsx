import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CategoriesPageProps = {
  searchParams: Promise<{
    tag?: string;
  }>;
};

export const metadata = {
  title: "Categories | Silent Folio",
  description:
    "Browse the editorial categories of Silent Folio and explore essays by theme, discipline, and literary archive.",
};

const categoryVisuals = [
  {
    slug: "philosophy",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCWGQ8ynyoWwgDCZM8rIKDCuF9k1rxh9R9mk4Gj0qW4nr-kZHWxg-0Ma4zNQDT9J5XDdL5GiUHwCtU8YS69J1pxwM__Gi48mQ9Bch41WCESQkxN-CsBHfhN-FCm53y1_KPDpXMQzcyzNC0i0k1t5NVrs2jXSnnzoxTz_wvtJeHaLMalxB_qHlK44cun2GCXNBSSioDigxIhehiap5TKD-1Lrn8Q5poRj7rkjP5Bp19xLVrcyEedaHO7Z4h-lfb1DsW1H_kprtTxytY",
    alt: "Minimalist study",
    size: "featured" as const,
  },
  {
    slug: "architecture",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtGsDePpzIlvC0-zZitlU-z7LlHZpDM0C2xZx9TRIrij-eedrLrL3OMreB2ueiXkvtqVIiGINUxgIBoOX9BpUqUCtSlXB_DLtWc6wysIZSQ2rSrZ6uUguHUAfJOa2ozLMb_8RraGr62TvQsaINnLgpbsaaOOK9W2XwVOaxn-AxEWH0XBRlakRi3T7xXloFn5spB3_GHSLCTZtzq-wHrwep2gFB_semyaNivbZgIA8UOu4chTBkGkY2WxQchK_vFbLqem6vjtwMRnk",
    alt: "Architectural curves",
    size: "tall" as const,
  },
  {
    slug: "lifestyle",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBn6cSucvJsIK8k3LR91S0QfpGv5iSbPAuxwaeIl12vaAvUpw7gDD9zQL8xjFcK2OtxhfajnKlZhyfX0vsdRdMtOR6ioifnDc_WCfUEH6jaD9r9Fxhnan-onhH3kHLQ_LQwrMdp0AnrlA_hK6_8URCp3gbnngdPLszJ0xfhBFw3Gux7k_MnqC5C-w-alX-7uBuIITAZ5lYpjP5XUd9hflw6e1VQvI1AVqFukjRXbKr-RrpuT36ZOVjH-_lFgXFVkj8Uy5YdAIZeXoU",
    alt: "Garden path",
    size: "square" as const,
  },
  {
    slug: "design",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOxtiH2WCat20jIy1uo_nOgCroqruJ8RXyuJxTgbQb39PlRnnN6nSwiIRaPN3lMxTd7VTKzmMvVs9wG8oQBWwoRbqxZXdKXCnIb1LKZ_KFiK2dzrX8wjZsjXS7-2BM0Eg-1752TCFsLNpb9xt05LBGOKkRtdzX-gDK81fTukjorf7pX5Moi1_fDpu61c-NK1X7xka9E_mw6ut0aiAzYjcJ1BBlLO9Xk5ZRZLbaCRpcPWbn1HVvPzavvXJEqqAwit8B4Nsla2USv2U",
    alt: "Artist portrait",
    size: "square" as const,
  },
];

function normalizeTag(value: string) {
  return value.trim().toLowerCase();
}

function startCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCategoryVisual(slug: string, index: number) {
  const matched = categoryVisuals.find((item) => item.slug === slug);
  if (matched) {
    return matched;
  }

  return categoryVisuals[index % categoryVisuals.length];
}

function getCardClasses(size: "featured" | "tall" | "square", index: number) {
  if (size === "featured") {
    return "md:col-span-8";
  }

  if (size === "tall") {
    return "md:col-span-4 md:row-span-2";
  }

  return index % 2 === 0 ? "md:col-span-4" : "md:col-span-6";
}

function getMediaClasses(size: "featured" | "tall" | "square") {
  if (size === "featured") {
    return "aspect-video";
  }

  if (size === "tall") {
    return "aspect-4/5";
  }

  return "aspect-square";
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const { tag } = await searchParams;
  const normalizedTag = tag ? normalizeTag(tag) : null;

  const categories = await prisma.category.findMany({
    include: {
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
          title: true,
          slug: true,
          readTime: true,
          publishedAt: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          posts: {
            where: {
              published: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const filteredCategories = normalizedTag
    ? categories.filter(
        (category) =>
          normalizeTag(category.slug) === normalizedTag ||
          normalizeTag(category.name) === normalizedTag
      )
    : categories;

  const activeLabel = normalizedTag ? startCase(normalizedTag) : null;

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
      <header className="mb-16 md:mb-20 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs uppercase tracking-[0.25em] text-[#5c605d]">
            Editorial Taxonomy
          </span>
          {activeLabel && (
            <>
              <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#545f6c]">
                Filtered by {activeLabel}
              </span>
            </>
          )}
        </div>

        <h1 className="text-5xl md:text-7xl font-headline tracking-tight text-[#2f3331] leading-none mb-6">
          Browse Categories
        </h1>

        <p className="text-[#5c605d] text-lg leading-relaxed max-w-2xl">
          Deliberate explorations across the landscape of art, philosophy, and
          the quiet spaces in between. Explore the archive by theme, then drift
          deeper into the essays that define each collection.
        </p>

        {activeLabel && (
          <div className="mt-8">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#545f6c] hover:text-[#2f3331] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Clear Filter
            </Link>
          </div>
        )}
      </header>

      {filteredCategories.length === 0 ? (
        <section className="border border-[#afb3b0]/20 bg-[#f3f4f1] px-8 py-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#5c605d] mb-4">
            No Matching Category
          </p>
          <h2 className="text-3xl font-headline italic text-[#2f3331] mb-4">
            Nothing matched this tag.
          </h2>
          <p className="text-[#5c605d] max-w-xl mx-auto leading-relaxed mb-8">
            The archive does not currently contain a category for this filter.
            Try browsing all categories to discover the full collection.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-3 border-b border-[#545f6c]/30 pb-1 text-xs uppercase tracking-[0.24em] text-[#545f6c] hover:text-[#2f3331] hover:border-[#2f3331]/40 transition-all"
          >
            Explore All Categories
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {filteredCategories.map((category, index) => {
            const visual = getCategoryVisual(category.slug, index);
            const postCount = category._count.posts;
            const latestPost = category.posts[0];

            return (
              <article
                key={category.id}
                className={`${getCardClasses(visual.size, index)} group`}
              >
                <div className="relative overflow-hidden mb-6 bg-[#f3f4f1]">
                  <div className={getMediaClasses(visual.size)}>
                    <img
                      alt={visual.alt}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      src={visual.image}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                <div className="border-b border-[#afb3b0]/10 pb-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-headline tracking-tight text-[#2f3331]">
                        {category.name}
                      </h2>
                      <span className="mt-2 block text-[10px] uppercase tracking-[0.22em] text-[#5c605d]">
                        {category.description || `${category.name} Collection`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <span className="text-xs text-[#5c605d]">
                        {postCount} {postCount === 1 ? "Essay" : "Essays"}
                      </span>
                      <span className="material-symbols-outlined text-sm text-[#545f6c]">
                        arrow_forward
                      </span>
                    </div>
                  </div>

                  {latestPost ? (
                    <div className="mt-6 space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d]">
                        Latest in this category
                      </p>
                      <Link
                        href={`/posts/${latestPost.slug}`}
                        className="block text-lg leading-relaxed text-[#2f3331] hover:italic transition-all"
                      >
                        {latestPost.title}
                      </Link>
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#5c605d]">
                        <span>{latestPost.readTime} min read</span>
                        <span className="h-1 w-1 rounded-full bg-[#afb3b0]" />
                        <span>
                          {new Date(
                            latestPost.publishedAt || latestPost.createdAt
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-6 text-sm leading-relaxed text-[#5c605d]">
                      No published essays yet in this category.
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Link
                      href={`/categories?tag=${encodeURIComponent(category.slug)}`}
                      className="text-[10px] uppercase tracking-[0.24em] text-[#545f6c] border-b border-[#545f6c]/25 pb-1 hover:text-[#2f3331] hover:border-[#2f3331]/30 transition-all"
                    >
                      Filter by {category.name}
                    </Link>

                    {latestPost && (
                      <Link
                        href={`/posts/${latestPost.slug}`}
                        className="text-[10px] uppercase tracking-[0.24em] text-[#5c605d] hover:text-[#2f3331] transition-colors"
                      >
                        Read Latest Essay
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
