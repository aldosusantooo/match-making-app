import type { NextConfig } from "next";

// Hosts that still reach the app but should hand visitors on to bisai.id:
// the www variant, and Railway's original domain, which early session links
// point at. Path and query (session id, UTM tags) carry over. Next matches
// these as anchored regexes, hence the escaped dots.
const LEGACY_HOSTS = [
  "www\\.bisai\\.id",
  "match-making-app-production\\.up\\.railway\\.app",
];

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://bisai.id/:path*",
      permanent: true,
    }));
  },
};

export default nextConfig;
