/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      encoding: false,
    }
    return config
  },
}

module.exports = nextConfig
