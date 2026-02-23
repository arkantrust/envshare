/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "twitter.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
    ],
  },
};

module.exports = nextConfig;
