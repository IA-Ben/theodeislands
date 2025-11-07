import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Port configuration - use 3000 by default
  // Set via CLI: next dev -p 3000 or environment variable PORT=3000

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'storage.googleapis.com' }]
  },

  // Remove webpack config when using Turbopack
  // Turbopack doesn't use webpack, so this causes the warning
  // If you need custom config, use experimental.turbo instead

  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  trailingSlash: false,

  // Turbopack-specific configuration (optional)
  experimental: {
    turbo: {
      // Turbopack rules go here if needed
      rules: {
        // Custom loader rules for Turbopack
      }
    }
  }
}

export default nextConfig
