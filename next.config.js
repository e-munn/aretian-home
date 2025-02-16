/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '"lh3.googleusercontent.com"',
      },
    ],
  },
  compiler: {
    // removeConsole: true,
  },
}
