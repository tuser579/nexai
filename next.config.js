/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Required for NextAuth v5 on Vercel ────────
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // ── Suppress specific warnings ────────────────
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'mongoose']
    return config
  },
}

module.exports = nextConfig