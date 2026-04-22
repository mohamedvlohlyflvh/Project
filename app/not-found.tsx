import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-[#faf9f7] text-[#2f3331]">
      <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-32 text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#5c605d]">
          404 • Page Not Found
        </p>

        <h1 className="mb-6 text-5xl leading-tight tracking-tight md:text-7xl">
          <span className="font-headline italic">The page you seek is not in this archive.</span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg leading-8 text-[#5c605d] md:text-xl">
          The document may have been moved, removed, or perhaps it was never
          catalogued at all. Return to the folio and continue reading from the
          main collection.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#545f6c] px-8 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-all duration-300 hover:bg-[#485460]"
          >
            Return Home
          </Link>

          <Link
            href="/posts"
            className="inline-flex items-center justify-center border border-[#afb3b0]/25 px-8 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#5c605d] transition-all duration-300 hover:border-[#545f6c]/30 hover:bg-[#f3f4f1] hover:text-[#2f3331]"
          >
            Browse Essays
          </Link>
        </div>

        <div className="mt-16 h-px w-24 bg-[#afb3b0]/25" />
      </section>
    </main>
  );
}
