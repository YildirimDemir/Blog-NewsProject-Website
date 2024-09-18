/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URL: process.env.MONGODB_URL,
    ADMIN_API_URL: process.env.ADMIN_API_URL,
    EDITOR_API_URL: process.env.EDITOR_API_URL,
    WEBSITE_API_URL: process.env.WEBSITE_API_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
            port: '',
            pathname: '/**',
          },
        ],
    },
};

export default nextConfig;
