import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // 브라우저 환경에서 'readline' 모듈을 빈 객체로 대체
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        readline: false,
      };
    }
    return config;
  },
};

export default nextConfig;
