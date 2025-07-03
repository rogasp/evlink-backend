import type { NextConfig } from 'next'

const nextConfig: NextConfig  = {
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media2.giphy.com',
        pathname: '/media/v1/**', // detta täcker hela din nuvarande URL
      },
    ],
  },
};

export default nextConfig;
