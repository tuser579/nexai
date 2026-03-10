/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Turbopack config (Next.js 16 default) ─────
  turbopack: {},

  // ── Image domains ─────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // ── Serverless / Vercel optimizations ─────────
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  // ── Environment ───────────────────────────────
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.AUTH_URL || '',
  },
}

module.exports = nextConfig