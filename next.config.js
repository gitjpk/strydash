/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (Next.js 16+)
  turbopack: {
    resolveAlias: {
      'better-sqlite3': 'better-sqlite3',
    },
  },
  // Keep webpack config for backwards compatibility
  webpack: (config, { isServer }) => {
    // Fix for better-sqlite3
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  },
}

module.exports = nextConfig
