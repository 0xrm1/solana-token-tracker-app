/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.quicky.trading', 'quicky.trading'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.quicky.trading/api/:path*',
      },
      {
        source: '/ws/:path*',
        destination: '/wss://api.quicky.trading/ws/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 