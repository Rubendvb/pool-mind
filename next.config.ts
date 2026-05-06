import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevents Turbopack from bundling web-push into the server chunk.
  // The module is required at runtime via Node.js require(), avoiding
  // module-level evaluation during the build's page-data collection phase.
  serverExternalPackages: ["web-push"],
};

export default nextConfig;
