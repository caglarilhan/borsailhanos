import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(function middleware(_req: NextRequest) {}, {
  callbacks: {
    authorized: ({ token, req }: { token: unknown; req: NextRequest }) => {
      const path = req.nextUrl.pathname;
      // Protect /dashboard for any authenticated user
      if (path.startsWith("/dashboard")) {
        return !!token;
      }
      // Protect /admin for admin role only
      if (path.startsWith("/admin")) {
        return !!token && (token as unknown as { role?: string }).role === "admin";
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};


