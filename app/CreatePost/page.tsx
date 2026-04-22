import { redirect } from "next/navigation";

import CreatePostForm from "./CreatePostForm";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export default async function CreatePostPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-32">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#5c605d]">
          Editorial Workspace
        </p>
        <h1 className="mb-4 text-4xl italic text-[#2f3331] md:text-5xl font-headline">
          Create New Post
        </h1>
        <p className="text-lg leading-8 text-[#5c605d]">
          Draft a new essay for Silent Folio. Add your title, excerpt, body
          content, and publication preferences below.
        </p>
      </div>

      <div className="border border-[#afb3b0]/15 bg-white p-6 shadow-sm md:p-8">
        <CreatePostForm categories={categories} />
      </div>
    </main>
  );
}
