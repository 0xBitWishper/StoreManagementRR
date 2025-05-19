/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktifkan App Router
  experimental: {
    serverActions: true,
  },
  // Konfigurasi untuk Vercel
  output: "standalone",
  // Konfigurasi untuk transpile modul
  transpilePackages: ["lucide-react"],
  // Konfigurasi untuk image domains
  images: {
    domains: ["avatars.githubusercontent.com", "github.com", "lh3.googleusercontent.com"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
