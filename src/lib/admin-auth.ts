import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The admin dashboard sits behind HTTP Basic auth against ADMIN_PASSWORD:
 * one operator, one shared password, and the browser's own prompt is the
 * login screen. The username is ignored.
 *
 * Unset, the dashboard stays shut rather than open.
 */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function isAdminAuthorized(authorization: string | null): boolean {
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password || !authorization?.startsWith("Basic ")) {
    return false;
  }
  const decoded = Buffer.from(authorization.slice(6), "base64").toString(
    "utf8",
  );
  const supplied = decoded.slice(decoded.indexOf(":") + 1);
  // Hashing first hands timingSafeEqual equal-length inputs, so the check
  // leaks neither the password nor its length through timing.
  return timingSafeEqual(sha256(supplied), sha256(password));
}

const sha256 = (value: string) => createHash("sha256").update(value).digest();
