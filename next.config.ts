import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-011ed7d2-6d8e-4dbb-8d32-d0598c090329.space-z.ai",
  ],
};

export default nextConfig;
