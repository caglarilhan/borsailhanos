// Simple AES-GCM (browser) helper using Web Crypto API

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptStringAesGcm(plaintext: string, base64Key: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importKeyFromBase64(base64Key);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(plaintext)
  );
  const combined = new Uint8Array(iv.byteLength + (ciphertext as ArrayBuffer).byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext as ArrayBuffer), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptStringAesGcm(encoded: string, base64Key: string): Promise<string> {
  const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const key = await importKeyFromBase64(base64Key);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return textDecoder.decode(plaintext);
}


