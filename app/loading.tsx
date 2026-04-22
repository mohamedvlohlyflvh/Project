export default function Loading() {
  return (
    <main className="min-h-[60vh] bg-[#faf9f7] pt-32 pb-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 md:px-12">
        <div className="flex items-center gap-4 text-[#545f6c]">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#afb3b0]/40 border-t-[#545f6c]" />
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#5c605d]">
              Silent Folio
            </p>
            <p className="font-headline text-3xl italic text-[#2f3331]">
              Preparing the archive...
            </p>
          </div>
        </div>

        <div className="mt-12 w-full max-w-3xl space-y-6">
          <div className="h-6 w-32 animate-pulse bg-[#f3f4f1]" />
          <div className="h-16 w-full animate-pulse bg-[#f3f4f1]" />
          <div className="h-64 w-full animate-pulse bg-[#f3f4f1]" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse bg-[#f3f4f1]" />
            <div className="h-4 w-[92%] animate-pulse bg-[#f3f4f1]" />
            <div className="h-4 w-[84%] animate-pulse bg-[#f3f4f1]" />
          </div>
        </div>
      </div>
    </main>
  );
}
