import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 🔥 Esto desactiva la optimización automática
  },
};

export default nextConfig;