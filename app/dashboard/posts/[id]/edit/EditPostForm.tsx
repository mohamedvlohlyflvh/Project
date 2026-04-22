"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
};

type EditPostFormProps = {
  postId: string;
  initialData: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    categoryId: string | null;
    readTime: number;
    published: boolean;
  };
  categories: Category[];
};

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  readTime: string;
  published: boolean;
};

type FormErrors = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  categoryId?: string;
  readTime?: string;
  form?: string;
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidImageUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  const trimmedTitle = data.title.trim();
  const trimmedSlug = data.slug.trim();
  const trimmedExcerpt = data.excerpt.trim();
  const trimmedContent = data.content.trim();
  const trimmedCoverImage = data.coverImage.trim();
  const readTimeNumber = Number(data.readTime);

  if (!trimmedTitle) {
    errors.title = "Title is required.";
  } else if (trimmedTitle.length < 8) {
    errors.title = "Title should be at least 8 characters.";
  } else if (trimmedTitle.length > 140) {
    errors.title = "Title should be under 140 characters.";
  }

  if (!trimmedSlug) {
    errors.slug = "Slug is required.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
    errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens.";
  } else if (trimmedSlug.length < 3) {
    errors.slug = "Slug should be at least 3 characters.";
  } else if (trimmedSlug.length > 80) {
    errors.slug = "Slug should be under 80 characters.";
  }

  if (trimmedExcerpt && trimmedExcerpt.length > 260) {
    errors.excerpt = "Excerpt should be 260 characters or fewer.";
  }

  if (!trimmedContent) {
    errors.content = "Content is required.";
  } else if (trimmedContent.length < 120) {
    errors.content = "Content should be at least 120 characters.";
  }

  if (!data.categoryId) {
    errors.categoryId = "Please select a category.";
  }

  if (!data.readTime) {
    errors.readTime = "Read time is required.";
  } else if (!Number.isFinite(readTimeNumber) || !Number.isInteger(readTimeNumber)) {
    errors.readTime = "Read time must be a whole number.";
  } else if (readTimeNumber < 1 || readTimeNumber > 120) {
    errors.readTime = "Read time must be between 1 and 120 minutes.";
  }

  if (!isValidImageUrl(trimmedCoverImage)) {
    errors.coverImage = "Please enter a valid image URL.";
  }

  return errors;
}

export default function EditPostForm({
  postId,
  initialData,
  categories,
}: EditPostFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: initialData.title,
    slug: initialData.slug,
    excerpt: initialData.excerpt ?? "",
    content: initialData.content,
    coverImage: initialData.coverImage ?? "",
    categoryId: initialData.categoryId ?? "",
    readTime: String(initialData.readTime),
    published: initialData.published,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const liveSlug = useMemo(() => generateSlug(formData.title), [formData.title]);

  const handleChange =
    <K extends keyof FormData>(field: K) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const target = event.target;

      setFormData((prev) => {
        if (field === "published" && target instanceof HTMLInputElement) {
          return {
            ...prev,
            published: target.checked,
          };
        }

        const nextValue = target.value;

        if (field === "title") {
          const shouldAutoGenerateSlug =
            prev.slug.trim() === "" || prev.slug === generateSlug(prev.title);

          return {
            ...prev,
            title: nextValue,
            slug: shouldAutoGenerateSlug ? generateSlug(nextValue) : prev.slug,
          };
        }

        return {
          ...prev,
          [field]: nextValue,
        };
      });

      setErrors((prev) => ({ ...prev, form: undefined }));
    };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm(formData));
  };

  const fieldError = (field: keyof FormErrors, sourceField?: keyof FormData) => {
    if (sourceField && !touched[sourceField]) return undefined;
    return errors[field];
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);
    setTouched({
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      categoryId: true,
      readTime: true,
      published: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim() || null,
        content: formData.content.trim(),
        coverImage: formData.coverImage.trim() || null,
        categoryId: formData.categoryId || null,
        readTime: Number(formData.readTime),
        published: formData.published,
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | { id?: string; slug?: string; error?: string; fieldErrors?: FormErrors }
        | null;

      if (!response.ok) {
        setErrors({
          ...(data?.fieldErrors ?? {}),
          form: data?.error || "Unable to update the post right now.",
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({
        form: "A network error occurred while updating the post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this post? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!response.ok || !data?.success) {
        setErrors({
          form: data?.error || "Unable to delete this post right now.",
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({
        form: "A network error occurred while deleting the post. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.form && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errors.form}
        </div>
      )}

      <section className="space-y-6 rounded-2xl border border-[#afb3b0]/20 bg-white/70 p-6 shadow-sm">
        <div>
          <h2 className="font-headline text-xl italic text-[#2f3331]">
            Editorial Details
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5c605d]">
            Update the title, URL slug, excerpt, and publishing state of this essay.
          </p>
        </div>

        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-[#2f3331]"
          >
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange("title")}
            onBlur={() => handleBlur("title")}
            aria-invalid={Boolean(fieldError("title", "title"))}
            aria-describedby={fieldError("title", "title") ? "title-error" : "title-help"}
            className="w-full rounded-lg border border-[#afb3b0]/30 px-4 py-3 transition-colors focus:border-[#545f6c] focus:outline-none focus:ring-2 focus:ring-[#545f6c]/20"
            placeholder="The Architecture of Silence"
          />
          <p id="title-help" className="mt-2 text-xs text-[#5c605d]">
            Keep it readable for archive listings, previews, and metadata.
          </p>
          {fieldError("title", "title") && (
            <p id="title-error" className="mt-2 text-sm text-red-600">
              {fieldError("title", "title")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-medium text-[#2f3331]"
          >
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleChange("slug")}
            onBlur={() => handleBlur("slug")}
            aria-invalid={Boolean(fieldError("slug", "slug"))}
            aria-describedby={fieldError("slug", "slug") ? "slug-error" : "slug-help"}
            className="w-full rounded-lg border border-[#afb3b0]/30 bg-[#f3f4f1] px-4 py-3 transition-colors focus:border-[#545f6c] focus:outline-none focus:ring-2 focus:ring-[#545f6c]/20"
            placeholder="the-architecture-of-silence"
          />
          <p id="slug-help" className="mt-2 text-xs text-[#5c605d]">
            Preview:{" "}
            <span className="font-medium">
              /posts/{formData.slug || liveSlug || "your-slug"}
            </span>
          </p>
          {fieldError("slug", "slug") && (
            <p id="slug-error" className="mt-2 text-sm text-red-600">
              {fieldError("slug", "slug")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="mb-2 block text-sm font-medium text-[#2f3331]"
          >
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={4}
            value={formData.excerpt}
            onChange={handleChange("excerpt")}
            onBlur={() => handleBlur("excerpt")}
            aria-invalid={Boolean(fieldError("excerpt", "excerpt"))}
            aria-describedby={
              fieldError("excerpt", "excerpt") ? "excerpt-error" : "excerpt-help"
            }
            className="w-full resize-none rounded-lg border border-[#afb3b0]/30 px-4 py-3 transition-colors focus:border-[#545f6c] focus:outline-none focus:ring-2 focus:ring-[#545f6c]/20"
            placeholder="A short summary of the article..."
          />
          <div className="mt-2 flex items-center justify-between gap-4 text-xs text-[#5c605d]">
            <p id="excerpt-help">Optional, but recommended for listing previews and SEO.</p>
            <span>{formData.excerpt.length}/260</span>
          </div>
          {fieldError("excerpt", "excerpt") && (
            <p id="excerpt-error" className="mt-2 text-sm text-red-600">
              {fieldError("excerpt", "excerpt")}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-[#afb3b0]/20 bg-white/70 p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-medium text-[#2f3331]"
            >
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange("categoryId")}
              onBlur={() => handleBlur("categoryId")}
              aria-invalid={Boolean(fieldError("categoryId", "categoryId"))}
              aria-describedby={
                fieldError("categoryId", "categoryId") ? "category-error" : undefined
              }
              className="w-full rounded-lg border border-[#afb3b0]/30 px-4 py-3 transition-colors focus:border-[#545f6c] focus:outline-none focus:ring-2 focus:ring-[#545f6c]/20"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldError("categoryId", "categoryId") && (
              <p id="category-error" className="mt-2 text-sm text-red-600">
                {fieldError("categoryId", "categoryId")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="readTime"
              className="mb-2 block text-sm font-medium text-[#2f3331]"
            >
              Read Time (minutes) *
            </label>
            <input
              id="readTime"
              name="readTime"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={formData.readTime}
              onChange={handleChange("readTime")}
              onBlur={() => handleBlur("readTime")}
              aria-invalid={Boolean(fieldError("readTime", "readTime"))}
              aria-describedby={
                fieldError("readTime", "readTime") ? "readTime-error" : "readTime-help"
              }
              className="w-full rounded-lg border border-[#afb3b0]/30 px-4 py-3 transition-colors focus:border-[#545f6c] focus:outline-none focus:ring-2 focus:ring-[#545f6c]/20"
            />
            <p id="readTime-help" className="mt-2 text-xs text-[#5c605d]">
              Use a realistic estimate between 1 and 120 minutes.
            </p>
            {fieldError("readTime", "readTime") && (
              <p id="readTime-error" className="mt-2 text-sm text-red-600">
                {fieldError("readTime", "readTime")}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="coverImage"
            className="mb-2 block text-sm font-medium text-[#2f3331]"
          >
            Cover Image URL
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="url"
            value={formData.coverImage}
            onChange={handleChange("coverImage")}
            onBlur={() => handleBlur("coverImage")}
            aria-invalid={Boolean(fieldError("coverImage", "coverImage"))}
            aria-describedby={
              fieldError("coverImage", "coverImage")
                ? "coverImage-error"
                : "coverImage-help"
            }
            className="w-full rounded-lg border border-[#afb3b0]/30 px-4 py-3 transition-colors focus:border-[#545f6c] focus:outline-none focus:ring-2 focus:ring-[#545f6c]/20"
            placeholder="https://example.com/cover-image.jpg"
          />
          <p id="coverImage-help" className="mt-2 text-xs text-[#5c605d]">
            Optional. Use a public HTTP/HTTPS image URL.
          </p>
          {fieldError("coverImage", "coverImage") && (
            <p id="coverImage-error" className="mt-2 text-sm text-red-600">
              {fieldError("coverImage", "coverImage")}
            </p>
          )}

          {formData.coverImage.trim() && isValidImageUrl(formData.coverImage) && (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#afb3b0]/20 bg-[#f3f4f1]">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="max-h-72 w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-[#afb3b0]/20 bg-white/70 p-6 shadow-sm">
        <div>
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-[#2f3331]"
          >
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            rows={18}
            value={formData.content}
            onChange={handleChange("content")}
            onBlur={() => handleBlur("content")}
            aria-invalid={Boolean(fieldError("content", "content"))}
            aria-describedby={
              fieldError("content", "content") ? "content-error" : "content-help"
            }
            className="w-full resize-none rounded-lg border border-[#afb3b0]/30 px-4 py-3 font-mono text-sm leading-7 transition-colors focus:border-[#545f6c] focus:outline-none focus:ring-2 focus:ring-[#545f6c]/20"
            placeholder={`Write your article here...

You can separate paragraphs with blank lines.
Use "## Heading" for subheadings.
Use "> Quote" for blockquotes.
Use "- item" for lists.`}
          />
          <div className="mt-2 flex items-center justify-between gap-4 text-xs text-[#5c605d]">
            <p id="content-help">Structure your writing clearly for better reading flow.</p>
            <span>{formData.content.trim().length} characters</span>
          </div>
          {fieldError("content", "content") && (
            <p id="content-error" className="mt-2 text-sm text-red-600">
              {fieldError("content", "content")}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-[#afb3b0]/20 bg-[#f3f4f1] px-4 py-4">
          <input
            id="published"
            name="published"
            type="checkbox"
            checked={formData.published}
            onChange={handleChange("published")}
            className="mt-1 h-5 w-5 rounded border-[#afb3b0]/30"
          />
          <div>
            <label htmlFor="published" className="text-sm font-medium text-[#2f3331]">
              Publish this post
            </label>
            <p className="mt-1 text-xs leading-6 text-[#5c605d]">
              If unchecked, the post will remain a draft and won&apos;t appear in the public archive.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 pt-2 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isSubmitting}
          className="inline-flex items-center justify-center rounded-lg border border-red-200 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete Post"}
        </button>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-transparent px-8 py-3 text-sm font-semibold uppercase tracking-widest text-[#5c605d] transition-all hover:text-[#2f3331]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center justify-center rounded-lg bg-[#545f6c] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-[#485460] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
