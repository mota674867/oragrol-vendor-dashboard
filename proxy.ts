// Password gate for the whole app — this dashboard shows real vendor
// spend and account details, so nothing here should be reachable without
// the password. Uses HTTP Basic Auth (browser's own login prompt, no
// custom login page to build or get wrong) checked against
// DASHBOARD_PASSWORD. Username is ignored — only the password matters.
//
// Fails closed: if DASHBOARD_PASSWORD isn't set, every request is
// refused (500), never silently left open.
import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    return new NextResponse("DASHBOARD_PASSWORD is not set — refusing all requests until it is.", { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (auth) {
    const [, encoded] = auth.split(" ");
    try {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [, password] = decoded.split(":");
      if (password === expected) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="ORAGROL Vendor Dashboard"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
