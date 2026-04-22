/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // جلب أحدث 6 مقالات من قاعدة البيانات
  const latestArticles = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: true,
      category: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-187.75 flex items-center px-6 md:px-12 overflow-hidden bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <span className="text-xs uppercase tracking-[0.3em] text-[#5c605d] mb-6 block">
              Volume I • Edition II
            </span>
            <h1 className="text-6xl md:text-8xl font-headline italic leading-[1.1] tracking-tighter text-[#2f3331] mb-8">
              Where Deep Reading Meets Deliberate Design
            </h1>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Link
                href="/posts"
                className="px-10 py-5 bg-linear-to-br from-[#545f6c] to-[#485460] text-white text-xs uppercase tracking-widest font-bold rounded-sm shadow-xl transition-transform hover:-translate-y-0.5"
              >
                Explore Essays
              </Link>
              <Link
                href="/about"
                className="px-10 py-5 bg-transparent text-[#545f6c] text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-[#f3f4f1] transition-colors"
              >
                The Philosophy
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-4/5 bg-[#f3f4f1] rounded-lg overflow-hidden shadow-2xl">
              <img
                className="w-full h-full object-cover grayscale-[0.2] contrast-[0.95]"
                alt="Minimalist bookshelf"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyUsq_ovCLBxDa3x3sT9AIOR0IzB0FbmoF9mHkyTDH7GbqvSshyO5-R0U91pWHwvf4LOq08CNaTibkYnJYiZaWeSHEOH3z9Jqd_x9PKL8sEBjUSJRU3vmyDtax6g79vR3My26YcaC3dp13wA-AKfB2prgVIK9cU3l0OxjFxDPZcPdPAXgjP8SzHTpvIu8TuFO4VOz0wJIIfn-W0Q6Vvw4VFlshF0zmTXzE96ixklvpNcb_1MP0lJz7XVi9mJsK7CUkPoFjTS4zXmQ"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-xs hidden xl:block">
              <p className="text-lg italic leading-relaxed text-[#5c605d]">
                &ldquo;A book must be the axe for the frozen sea within us.&rdquo;
              </p>
              <p className="text-[10px] uppercase tracking-widest mt-4 text-[#777c79]">
                — Franz Kafka
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-[#f3f4f1]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex flex-col gap-6">
              <span className="material-symbols-outlined text-[#545f6c] text-3xl">
                auto_stories
              </span>
              <h3 className="text-2xl italic tracking-tight">
                Curated Content
              </h3>
              <p className="text-[#5c605d] leading-relaxed">
                Selecting only the most resonant voices in contemporary
                literature and philosophy to ensure every minute spent reading
                is meaningful.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <span className="material-symbols-outlined text-[#545f6c] text-3xl">
                psychology
              </span>
              <h3 className="text-2xl italic tracking-tight">
                Intellectual Depth
              </h3>
              <p className="text-[#5c605d] leading-relaxed">
                We bypass the surface level, diving deep into the structural
                and emotional marrow of the written word.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <span className="material-symbols-outlined text-[#545f6c] text-3xl">
                spa
              </span>
              <h3 className="text-2xl italic tracking-tight">
                Serene Environment
              </h3>
              <p className="text-[#5c605d] leading-relaxed">
                A distraction-free interface designed to mimic the tactile
                focus of a physical journal, respecting your digital
                well-being.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-32 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-20">
            <div>
              <h2 className="text-5xl tracking-tighter mb-4">
                Latest Archives
              </h2>
              <div className="h-px w-24 bg-[#545f6c]/20"></div>
            </div>
            <Link
              href="/posts"
              className="text-xs uppercase tracking-widest text-[#545f6c] border-b border-[#545f6c]/20 pb-1 hover:text-[#2f3331] transition-colors"
            >
              View All Works
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {latestArticles.map((article, index) => {
              // تحديد offset classes بناءً على index
              let offsetClass = "";
              if (index === 2) offsetClass = "lg:mt-0";
              if (index === 3) offsetClass = "lg:-mt-16";
              if (index === 5) offsetClass = "lg:-mt-16";

              return (
                <Link
                  key={article.id}
                  href={`/posts/${article.slug}`}
                  className={`flex flex-col group ${offsetClass}`}
                >
                  <div className="aspect-16/10 bg-[#edeeeb] overflow-hidden mb-8">
                    {article.coverImage && (
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={article.title}
                        src={article.coverImage}
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#5c605d]">
                      <span>{article.category?.name || "Uncategorized"}</span>
                      <span className="w-1 h-1 rounded-full bg-[#afb3b0]"></span>
                      <span>
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <h3 className="text-2xl leading-snug group-hover:italic transition-all">
                      {article.title}
                    </h3>
                    <p className="text-[#5c605d] line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="pt-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e6e9e6] flex items-center justify-center text-[10px] font-bold text-[#545f6c]">
                        {article.author?.name?.charAt(0) || "A"}
                      </div>
                      <span className="text-xs font-medium">
                        By {article.author?.name || "Anonymous"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
