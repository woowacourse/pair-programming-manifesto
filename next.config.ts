import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/pair-programming-manifesto',
  assetPrefix: '/pair-programming-manifesto',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
