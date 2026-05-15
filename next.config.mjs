/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  /**
   * `/api/v1/auth/*` has a dedicated Route Handler. **`/api/v1/[[...path]]`** proxies all other
   * `/api/v1/*` traffic to Express (cookies). Avoid `rewrites` to external URLs — cookies often
   * do not reach the backend → 401 on session-protected routes.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }],
      },
    ];
  },
};

export default nextConfig;
