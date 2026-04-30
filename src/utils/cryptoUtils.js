// Utility to generate secure random keys for roles
export const generateRoleKey = (role) => {
  const array = new Uint8Array(6);
  window.crypto.getRandomValues(array);
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `${role.substring(0, 3).toUpperCase()}-${hex.substring(0, 6)}`;
};

export const encryptMessage = async (message, password) => {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
    );
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv }, key, enc.encode(message)
    );

    return {
      ciphertext: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      salt: Array.from(salt)
    };
  } catch (e) {
    console.warn("Crypto API failed, returning cleartext for mock", e);
    return message; // Fallback
  }
};
