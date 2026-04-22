import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import "./globals.css";

const siteName = "Silent Folio";
const siteDescription =
  "A sanctuary for long-form essays, literary criticism, philosophy, and deliberate reading.";
const siteUrl = "https://silentfolio.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s • ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Silent Folio",
    "editorial archive",
    "essays",
    "literary criticism",
    "philosophy",
    "long-form writing",
    "reading culture",
    "digital magazine",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "literature",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    creator: "@silentfolio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Public+Sans:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-[#faf9f7] text-[#2f3331] selection:bg-[#d8e4f3] selection:text-[#48535f]">
          <Navbar />
          <main className="pt-20">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
