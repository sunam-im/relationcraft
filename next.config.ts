import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // src 디렉토리 명시적 사용
  experimental: {
    // 빈 루트 app 폴더 생성 방지
  },
  // Turbopack 설정
  turbo: {
    resolveAlias: {
      '@': './src',
    },
  },
};

export default nextConfig;
