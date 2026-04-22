"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="w-full max-w-2xl border border-[#afb3b0]/20 bg-[#f3f4f1] px-8 py-12 shadow-sm">
        <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#5c605d]">
          Runtime Exception
        </p>

        <h1 className="mb-6 text-4xl italic tracking-tight text-[#2f3331] md:text-5xl font-headline">
          The page lost its place in the archive.
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-base leading-8 text-[#5c605d] md:text-lg">
          Something unexpected happened while rendering this page. You can retry
          the request or return to the main archive.
        </p>

        {error.message ? (
          <div className="mb-8 rounded-sm border border-[#afb3b0]/20 bg-white px-4 py-4 text-left">
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#5c605d]">
              Error Details
            </p>
            <p className="break-words text-sm leading-7 text-[#2f3331]">
              {error.message}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center bg-[#545f6c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-[#485460]"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center border border-[#afb3b0]/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#5c605d] transition-all duration-300 hover:border-[#545f6c]/30 hover:bg-white hover:text-[#2f3331]"
          >
            Return Home
          </Link>

          <Link
            href="/posts"
            className="inline-flex items-center justify-center px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#545f6c] transition-colors duration-300 hover:text-[#2f3331]"
          >
            Browse Essays
          </Link>
        </div>
      </div>
    </main>
  );
}
