/* eslint-disable @next/next/no-img-element */


export default function AboutPage() {
  return (
      <main className="pt-40 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-12 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-7">
              <h1 className="text-6xl md:text-8xl font-headline italic tracking-tighter mb-8 text-[#2f3331]">
                The Quiet <br />
                Volume.
              </h1>
              <p className="text-xl md:text-2xl leading-relaxed text-[#5c605d] max-w-2xl">
                Silent Folio was born from a singular desire: to reclaim the
                pace of thought. In an era of algorithmic noise, we curate a
                sanctuary for the long-form, the nuanced, and the deliberate.
              </p>
            </div>
            <div className="md:col-span-5 pt-12">
              <div className="aspect-3/4 bg-[#f3f4f1] overflow-hidden">
                <img
                  alt="Silent Folio editorial interior"
                  className="w-full h-full object-cover grayscale opacity-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4AgPKPqU1ATH1qgyEiOTA_lCpIy3mr6NBeWQgn3QLLy9oE1LlhzliwoiGnLfdG1yYpCBnAKl8J1tWifQqq3befwSaD4Kkp1tDKAFY3q8Ewy5VE0YrZrZh1z73vn-gMW0jADUpwfYSMu2bvRTv4jU1WTHCsGxzRcgqIugMp5T8rTovOoDeyLfMKd5ulAe2uoj7_rUgvr2avtVhWtIDwIMThripu6131ctWZYoMESKFXAz6Umjz62bTz2ashLmc4ySkAQG3SmHdrDs"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="bg-[#f3f4f1] py-32 mb-32">
          <div className="max-w-7xl mx-auto px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#5c605d] block mb-6">
                  Our Vision
                </span>
                <h2 className="text-4xl font-headline italic mb-8">
                  Architectures of Meaning
                </h2>
                <p className="text-lg leading-[1.8] text-[#5c605d] mb-6">
                  We believe that reading is a physical act of presence. Our
                  vision is to transform the digital screen into a canvas as
                  quiet and authoritative as fine-press vellum. We don&apos;t just
                  publish text; we construct environments for contemplation.
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#5c605d] block mb-6">
                  Our Mission
                </span>
                <h2 className="text-4xl font-headline italic mb-8">
                  Curating the Deep Reading
                </h2>
                <p className="text-lg leading-[1.8] text-[#5c605d]">
                  Our mission is to support a global community of thinkers by
                  providing a platform that honors the depth of their inquiry.
                  By removing the friction of standard UI conventions, we allow
                  the prose to dictate the rhythm of the experience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
