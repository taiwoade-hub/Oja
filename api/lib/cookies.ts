import type { CookieOptions } from "hono/utils/cookie";

function isSecure(headers: Headers): boolean {
  const proto = headers.get("x-forwarded-proto");
  return proto === "https";
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const secure = isSecure(headers);

  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "None" : "Lax",
    secure,
  };
}
