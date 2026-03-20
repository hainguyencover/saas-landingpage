/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Server cũ đang host saas-mobile web export (check-in flow)
    const MOBILE_SERVER = 'http://109.123.243.65';

    return {
      // fallback: chỉ proxy khi KHÔNG có Next.js page nào khớp
      fallback: [
        // ── Check-in flow pages ──
        { source: '/welcome', destination: `${MOBILE_SERVER}/welcome` },
        { source: '/step-1-phone', destination: `${MOBILE_SERVER}/step-1-phone` },
        { source: '/step-2-name', destination: `${MOBILE_SERVER}/step-2-name` },
        { source: '/step-3-birthday', destination: `${MOBILE_SERVER}/step-3-birthday` },
        { source: '/step-4-email', destination: `${MOBILE_SERVER}/step-4-email` },
        { source: '/success', destination: `${MOBILE_SERVER}/success` },

        // ── Info pages ──
        { source: '/about', destination: `${MOBILE_SERVER}/about` },
        { source: '/feedback', destination: `${MOBILE_SERVER}/feedback` },
        { source: '/help', destination: `${MOBILE_SERVER}/help` },
        { source: '/settings', destination: `${MOBILE_SERVER}/settings` },
        { source: '/privacy-policy', destination: `${MOBILE_SERVER}/privacy-policy` },
        { source: '/terms-of-service', destination: `${MOBILE_SERVER}/terms-of-service` },

        // ── Static assets (JS bundles, CSS, images from Expo web export) ──
        { source: '/_expo/:path*', destination: `${MOBILE_SERVER}/_expo/:path*` },
        { source: '/assets/:path*', destination: `${MOBILE_SERVER}/assets/:path*` },
      ],
    };
  },
};

export default nextConfig;
