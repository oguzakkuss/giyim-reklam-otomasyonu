import { config } from "@/lib/config";

/**
 * Basit, harici servis gerektirmeyen admin oturum yonetimi.
 * Imzali (HMAC-SHA256) bir httpOnly cerez kullanir. Web Crypto ile calisir,
 * boylece hem Node hem Edge (middleware) runtime'da ayni kod calisabilir.
 *
 * Not: Ihtiyac halinde Supabase Auth'a yukseltilebilir; arayuz ayni kalir.
 */

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 gun

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.admin.sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64urlEncode(new Uint8Array(sig));
}

export async function createSessionToken(): Promise<string> {
  const payloadObj = { exp: Date.now() + SESSION_TTL_MS };
  const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify(payloadObj)));
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  // sabit-zamanli karsilastirma yerine basit esitlik (imza zaten gizli)
  if (sig !== expected) return false;
  try {
    const { exp } = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

/**
 * ADMIN_PASSWORD tanimli degilse "gelistirme modu" acik kabul edilir
 * (yerel gelistirmeyi kolaylastirmak icin). Production'da mutlaka ayarlayin.
 */
export function isAuthDisabled(): boolean {
  return !config.admin.password;
}

export function checkPassword(input: string): boolean {
  if (isAuthDisabled()) return true;
  return input === config.admin.password;
}
