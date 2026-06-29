import { describe, it, expect, afterEach } from "vitest";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { clientKey } from "../src/middleware/rateLimit.js";

// Build a minimal Express-like request for clientKey().
function makeReq(opts: {
  ip?: string;
  forwarded?: string;
  sign?: string;
}): Request {
  const headers: Record<string, string> = {};
  if (opts.forwarded) headers["x-nf-client-connection-ip"] = opts.forwarded;
  if (opts.sign) headers["x-nf-sign"] = opts.sign;
  return {
    headers,
    ip: opts.ip,
    socket: { remoteAddress: opts.ip },
  } as unknown as Request;
}

const SECRET = "test-proxy-signing-key";
const validSign = () =>
  jwt.sign({ iss: "netlify", site_url: "https://badaweb.netlify.app" }, SECRET, {
    algorithm: "HS256",
  });

describe("clientKey (rate-limit identity)", () => {
  afterEach(() => {
    delete process.env.PROXY_SIGNING_KEY;
  });

  it("falls back to req.ip when no forwarded header is present", () => {
    expect(clientKey(makeReq({ ip: "1.2.3.4" }))).toBe("1.2.3.4");
  });

  it("transitional mode (no signing key): trusts the forwarded client IP", () => {
    const req = makeReq({ ip: "10.0.0.1", forwarded: "9.9.9.9" });
    expect(clientKey(req)).toBe("9.9.9.9");
  });

  it("hardened mode: trusts the forwarded IP when the Netlify signature is valid", () => {
    process.env.PROXY_SIGNING_KEY = SECRET;
    const req = makeReq({ ip: "10.0.0.1", forwarded: "9.9.9.9", sign: validSign() });
    expect(clientKey(req)).toBe("9.9.9.9");
  });

  it("hardened mode: ignores a forged forwarded IP without a valid signature", () => {
    process.env.PROXY_SIGNING_KEY = SECRET;
    // Attacker hits the backend directly, forging the forwarded IP, no signature.
    const req = makeReq({ ip: "203.0.113.7", forwarded: "9.9.9.9" });
    expect(clientKey(req)).toBe("203.0.113.7");
  });

  it("hardened mode: ignores the forwarded IP when the signature is invalid", () => {
    process.env.PROXY_SIGNING_KEY = SECRET;
    const badSign = jwt.sign({ iss: "netlify" }, "wrong-secret", {
      algorithm: "HS256",
    });
    const req = makeReq({ ip: "203.0.113.7", forwarded: "9.9.9.9", sign: badSign });
    expect(clientKey(req)).toBe("203.0.113.7");
  });
});
