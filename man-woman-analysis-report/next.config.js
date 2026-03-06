const withPwa = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'rltvlhoqbicgfjgygwuu.supabase.co', 'image.pollinations.ai'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = withPwa(nextConfig);