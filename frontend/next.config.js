/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "standalone" is for the Docker image (bundles a self-contained server).
  // On Vercel, use the platform's native output instead — Vercel sets VERCEL=1.
  output: process.env.VERCEL ? undefined : "standalone",
};

module.exports = nextConfig;
