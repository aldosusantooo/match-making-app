import { afterEach, describe, expect, it, vi } from "vitest";
import { adminConfigured, isAdminAuthorized } from "../admin-auth";

const basic = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;

const PASSWORD = "correct horse battery";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isAdminAuthorized", () => {
  it("accepts the password with any username", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    expect(isAdminAuthorized(basic("admin", PASSWORD))).toBe(true);
    expect(isAdminAuthorized(basic("", PASSWORD))).toBe(true);
  });

  it("keeps colons in the password", () => {
    vi.stubEnv("ADMIN_PASSWORD", "a:b:c:d:e:f:g");
    expect(isAdminAuthorized(basic("admin", "a:b:c:d:e:f:g"))).toBe(true);
  });

  it("rejects a wrong or missing password", () => {
    vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
    expect(isAdminAuthorized(basic("admin", "wrong"))).toBe(false);
    expect(isAdminAuthorized(null)).toBe(false);
    expect(isAdminAuthorized("Bearer x")).toBe(false);
  });

  it("stays shut when the password is unset", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(adminConfigured()).toBe(false);
    expect(isAdminAuthorized(basic("admin", ""))).toBe(false);
  });

  it("accepts a short password", () => {
    vi.stubEnv("ADMIN_PASSWORD", "short");
    expect(adminConfigured()).toBe(true);
    expect(isAdminAuthorized(basic("admin", "short"))).toBe(true);
  });
});
