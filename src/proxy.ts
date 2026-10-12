import { type NextRequest, NextResponse } from "next/server";
import { adminConfigured, isAdminAuthorized } from "@/lib/admin-auth";

/**
 * Challenges the browser for the admin password before /admin renders. The
 * page checks again where it reads the data (Next's docs advise against
 * relying on Proxy alone), but only Proxy can answer with the 401 and
 * WWW-Authenticate header that make the browser show its sign-in prompt.
 */
export function proxy(request: NextRequest) {
  if (!adminConfigured()) {
    return new NextResponse(
      "Admin is switched off. Set ADMIN_PASSWORD and redeploy.",
      { status: 503 },
    );
  }
  if (isAdminAuthorized(request.headers.get("authorization"))) {
    return NextResponse.next();
  }
  return new NextResponse("Sign in to see the Bisai admin.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Bisai admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
