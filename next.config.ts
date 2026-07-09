import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Le défaut (1 Mo) rejette la plupart des vraies photos (logo, couvertures
      // d'ebook, photo de profil) avant même d'atteindre le code de validation.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
