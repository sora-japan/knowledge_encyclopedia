import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * ブラウザからは同一オリジンの /api だけを見せ、FastAPI のURLは伏せる。
   * 将来 Cookie 認証を入れたときに同一オリジンで完結させるための土台。
   */
  async rewrites() {
    const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL;
    if (!internalApiBaseUrl) {
      // 転送先が無いまま起動すると全APIが404になるので、ここで落とす
      throw new Error("INTERNAL_API_BASE_URL が設定されていません");
    }

    return [
      {
        source: "/api/:path*",
        // 末尾の / があっても // にならないように落とす
        destination: `${internalApiBaseUrl.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
