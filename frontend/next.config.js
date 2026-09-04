/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Google (OAuth avatars)
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },

  // In development, proxy /api/* to backend to avoid CORS cookie issues.
  // In production, set NEXT_PUBLIC_API_URL to your deployed backend URL.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
