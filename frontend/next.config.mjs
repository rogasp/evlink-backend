/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/backend/api/:path*',
          destination: 'http://localhost:8000/backend/api/:path*',
        },
      ]
    },
  }
  
  export default nextConfig
  