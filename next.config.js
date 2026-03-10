/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  serverExternalPackages: ['mongoose', 'bcryptjs'],
}

module.exports = nextConfig