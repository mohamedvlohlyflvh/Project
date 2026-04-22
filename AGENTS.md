<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Editorial Archive Project Rules

## Project Overview
A literary blog platform named "Silent Folio" or "The Editorial Archive" - a platform for long-form articles, philosophical and literary content.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma 7 (PostgreSQL on Neon)

## Design System
### Colors
- **Background:** `#faf9f7` (surface)
- **Text Primary:** `#2f3331` (on-surface)
- **Text Secondary:** `#5c605d` (on-surface-variant)
- **Primary Accent:** `#545f6c` (primary)
- **Primary Dark:** `#485460` (primary-dim)
- **Border Light:** `#afb3b0` (outline-variant)
- **Surface Low:** `#f3f4f1` (surface-container-low)

### Typography
- **Headlines:** 'Newsreader', serif (italic for emphasis)
- **Body:** 'Newsreader', serif
- **Labels/UI:** 'Public Sans', sans-serif (uppercase, tracking-widest)

### Spacing
- Container max-width: `1280px` (7xl)
- Page padding: `px-6 md:px-12`
- Section spacing: `mb-20`, `py-24`, `py-32`

## Styling Rules

1. **Always use Tailwind CSS** - Do not use regular CSS unless absolutely necessary
2. **Use semantic colors** - Use colors defined in config, not hex codes directly
3. **Responsive first** - Start with mobile then use md:, lg:, xl: breakpoints
4. **Hover effects** - Add `transition-all duration-300/500` to interactive elements
5. **Images** - Use `object-cover` and `grayscale` for literary feel
6. **Material Icons** - Use `material-symbols-outlined` with `font-variation-settings`

## Component Patterns

### Navbar
- Fixed top bar: `fixed top-0 w-full z-50`
- Background: `bg-[#faf9f7]/90 backdrop-blur-xl`
- Links: Home, Essays, Archives, About
- Subscribe button (shown for non-authenticated users only)
- Avatar and Sign Out for authenticated users

### PostCard
- Image with `aspect-[16/10]` ratio
- Title, category, read time, and date
- On hover: image scales `group-hover:scale-105`, title becomes italic

### Layout
- Main pages: Navbar and Footer integrated in layout
- Content pages: Display with Navbar and Footer
- Don't forget `pt-32` to offset the fixed navbar

## Auth Rules (Better Auth)

1. **Server Actions** - Use `requireAuth()` in Server Components
2. **Protected Routes** - Use `requireAuth()` at the beginning of the page
3. **API Routes** - Check session using `headers()`
4. **Client Components** - Use `authClient` for signIn/signOut/getSession

## Database Rules (Prisma 7)

1. **schema.prisma** - Contains only models (no datasource.url)
2. **prisma.config.ts** - Contains database connection settings
3. **Prisma Client** - Use modified `lib/prisma.ts`
4. **Relations** - Use `include` to fetch related data

## Code Style

1. **TypeScript** - Use explicit typing for props and state
2. **Server Components by default** - Use `'use client'` only when needed
3. **Imports order** - React/Next → Libraries → Components → Types → Styles
4. **Named exports** - Use `export default` for main Pages and Components
5. **ESLint** - Respect ESLint rules

## Performance Rules

1. **Images** - Use `next/image` for local images, `img` for external images
2. **Fonts** - Use `next/font/google` instead of link tags
3. **Lazy loading** - Use `dynamic(() => import(...))` for heavy components
4. **Caching** - Use `revalidatePath` and `revalidateTag` after mutations