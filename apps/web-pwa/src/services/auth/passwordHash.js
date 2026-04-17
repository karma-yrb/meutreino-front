const APP_PREFIX = "meutreino:";
const PBKDF2_ITERATIONS = 100_000;

/**
 * Hash a password with PBKDF2-SHA-256.
 * The salt is derived from a fixed app prefix + the user's email (lowercase),
 * which prevents cross-app rainbow-table reuse while remaining deterministic.
 * Returns a lowercase hex string (64 chars).
 */
export async function hashPassword(password, email) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const salt = enc.encode(APP_PREFIX + email.toLowerCase());
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(plaintext, email, storedHash) {
  const hash = await hashPassword(plaintext, email);
  return hash === storedHash;
}
