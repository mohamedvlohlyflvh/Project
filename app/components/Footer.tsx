import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 w-full border-t border-[#afb3b0]/15 bg-[#f3f4f1]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 md:px-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md space-y-4">
          <p className="text-lg font-headline italic text-[#2f3331]">
            Silent Folio
          </p>
          <p className="text-sm leading-7 text-[#5c605d]">
            A sanctuary for long-form essays, literary reflection, and quiet
            editorial thought.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-[#5c605d] transition-colors duration-300 hover:text-[#2f3331]"
          >
            Home
          </Link>
          <Link
            href="/posts"
            className="text-xs uppercase tracking-[0.2em] text-[#5c605d] transition-colors duration-300 hover:text-[#2f3331]"
          >
            Essays
          </Link>

          <Link
            href="/categories"
            className="text-xs uppercase tracking-[0.2em] text-[#5c605d] transition-colors duration-300 hover:text-[#2f3331]"
          >
            Categories
          </Link>
          <Link
            href="/about"
            className="text-xs uppercase tracking-[0.2em] text-[#5c605d] transition-colors duration-300 hover:text-[#2f3331]"
          >
            About
          </Link>
        </div>

        <p className="text-[11px] uppercase tracking-[0.2em] text-[#5c605d]">
          © 2026 Silent Folio
        </p>
      </div>
    </footer>
  );
}
