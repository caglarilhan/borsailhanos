// AES-GCM encryption utilities for sensitive data
// Uses Web Crypto API for client-side encryption

// == ENV-KEY BASED ENCRYPTION (legacy fallback) ==
export async function encryptNote(plaintext: string): Promise<string> {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_ENCRYPTION_KEY");
  }

  try {
    const keyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintextBuffer = new TextEncoder().encode(plaintext);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      plaintextBuffer
    );
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt note");
  }
}

export async function decryptNote(encryptedData: string): Promise<string> {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_ENCRYPTION_KEY");
  }

  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encryptedBuffer = combined.slice(12);
    const keyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encryptedBuffer
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt note");
  }
}

// Legacy function names for backward compatibility
export const encryptStringAesGcm = encryptNote;
export const decryptStringAesGcm = decryptNote;

// == PASSPHRASE-BASED ENCRYPTION (preferred for V1) ==
type KdfParams = { saltB64: string; iterations: number };
let cachedCryptoKey: CryptoKey | null = null;

function base64FromBytes(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function bytesFromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function hasPassphraseConfigured(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage.getItem("mt_kdf");
  } catch {
    return false;
  }
}

export async function setPassphrase(passphrase: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 150000; // pragmatic default
  const key = await deriveKeyFromPassphrase(passphrase, salt, iterations);
  cachedCryptoKey = key;
  const params: KdfParams = { saltB64: base64FromBytes(salt), iterations };
  try {
    window.localStorage.setItem("mt_kdf", JSON.stringify(params));
  } catch {}
}

async function getKeyFromStoredParams(passphrase: string): Promise<CryptoKey> {
  if (cachedCryptoKey) return cachedCryptoKey;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem("mt_kdf");
  } catch {}
  if (!raw) throw new Error("Passphrase not set");
  const params = JSON.parse(raw) as KdfParams;
  const salt = bytesFromBase64(params.saltB64);
  const key = await deriveKeyFromPassphrase(passphrase, salt, params.iterations);
  cachedCryptoKey = key;
  return key;
}

export async function encryptNoteWithPassphrase(plaintext: string, passphrase: string): Promise<string> {
  const key = await getKeyFromStoredParams(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintextBuffer = new TextEncoder().encode(plaintext);
  const encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintextBuffer);
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);
  return base64FromBytes(combined);
}

export async function decryptNoteWithPassphrase(encryptedDataB64: string, passphrase: string): Promise<string> {
  const key = await getKeyFromStoredParams(passphrase);
  const combined = bytesFromBase64(encryptedDataB64);
  const iv = combined.slice(0, 12);
  const encryptedBuffer = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedBuffer);
  return new TextDecoder().decode(decrypted);
}
