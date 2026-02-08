/**
 * Simple encryption utilities for API keys at rest
 * Uses AES-256-GCM for secure encryption
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
    const key = process.env.API_KEY_ENCRYPTION_SECRET;
    if (!key) {
        throw new Error(
            "API_KEY_ENCRYPTION_SECRET environment variable is required"
        );
    }
    // If the key is already 32 bytes hex (64 chars), use it directly
    if (key.length === 64) {
        return Buffer.from(key, "hex");
    }
    // Otherwise, derive a key from the secret
    return crypto.scryptSync(key, "superapp-salt", 32);
}

/**
 * Encrypt a string value
 * Returns format: iv:authTag:encryptedData (all hex encoded)
 */
export function encrypt(text: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * Expects format: iv:authTag:encryptedData (all hex encoded)
 */
export function decrypt(encryptedText: string): string {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

    if (!ivHex || !authTagHex || !encrypted) {
        throw new Error("Invalid encrypted text format");
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

/**
 * Mask an API key for display (show first 4 and last 4 characters)
 */
export function maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
        return "****";
    }
    return `${apiKey.slice(0, 4)}${"*".repeat(apiKey.length - 8)}${apiKey.slice(-4)}`;
}
