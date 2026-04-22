"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Essays", href: "/posts" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#afb3b0]/10 bg-[#faf9f7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <span className="material-symbols-outlined text-[#545f6c] transition-transform duration-300 group-hover:rotate-6">
            menu_book
          </span>
          <span className="text-2xl font-serif font-bold tracking-tighter text-[#2f3331]">
            Silent Folio
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b pb-0.5 text-xs font-medium uppercase tracking-widest transition-colors duration-300 ${
                isActive(link.href)
                  ? "border-[#2f3331] text-[#2f3331]"
                  : "border-transparent text-[#5c605d] hover:text-[#2f3331]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          {isSignedIn ? (
            <>
              <Link
                href="/CreatePost"
                className="hidden text-xs uppercase tracking-widest text-[#545f6c] transition-colors duration-300 hover:text-[#2f3331] md:inline-flex"
              >
                Write
              </Link>

              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                      userButtonPopoverCard:
                        "rounded-none border border-[#afb3b0]/15 shadow-xl",
                      userButtonPopoverActionButton:
                        "text-[#2f3331] hover:bg-[#f3f4f1] transition-colors",
                      userButtonPopoverActionButtonText:
                        "text-xs uppercase tracking-widest",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="hidden text-xs uppercase tracking-widest text-[#5c605d] transition-colors duration-300 hover:text-[#2f3331] md:inline-flex"
                >
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="bg-[#545f6c] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:bg-[#485460] md:px-6"
                >
                  Subscribe
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-[#afb3b0]/10 bg-[#faf9f7]/95 md:hidden">
        <div className="flex justify-around px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-1 text-[10px] font-medium uppercase tracking-widest transition-colors duration-300 ${
                isActive(link.href)
                  ? "border-b border-[#2f3331] text-[#2f3331]"
                  : "text-[#5c605d] hover:text-[#2f3331]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
