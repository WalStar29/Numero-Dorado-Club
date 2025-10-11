import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // 🔥 Esto desactiva la optimización automática
  },
};

export default nextConfig;
