/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputStandalone: true,
  },
  basePath: '/atmos-token-distributor',
}

module.exports = nextConfig
