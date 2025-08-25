// AES-GCM encryption utilities for sensitive data
// Uses Web Crypto API for client-side encryption

export async function encryptNote(plaintext: string): Promise<string> {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_ENCRYPTION_KEY");
  }

  try {
    // Convert base64 key to ArrayBuffer
    const keyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Convert plaintext to ArrayBuffer
    const plaintextBuffer = new TextEncoder().encode(plaintext);
    
    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      plaintextBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Return as base64
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
    // Convert base64 to ArrayBuffer
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedBuffer = combined.slice(12);
    
    // Convert base64 key to ArrayBuffer
    const keyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encryptedBuffer
    );
    
    // Convert back to string
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt note");
  }
}

// Legacy function names for backward compatibility
export const encryptStringAesGcm = encryptNote;
export const decryptStringAesGcm = decryptNote;


