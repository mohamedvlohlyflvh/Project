import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",  // ← أضف هذا السطر
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/Posts",
        destination: "/posts",
        permanent: true,
      },
      {
        source: "/Posts/:slug",
        destination: "/posts/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
