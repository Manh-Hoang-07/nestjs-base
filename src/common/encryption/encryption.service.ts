import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;

    constructor() {
        const secret = process.env.ENCRYPTION_KEY;
        // For digital assets, we MUST have a strong key. 
        // If not provided, we use a fallback but warn (or should fail in prod)
        if (!secret || secret.length < 32) {
            this.key = Buffer.alloc(32, secret || 'default-secret-key-32-chars-long');
        } else {
            this.key = Buffer.from(secret.slice(0, 32));
        }
    }

    encrypt(text: string): string {
        if (!text) return text;
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decrypt(text: string): string {
        if (!text || !text.includes(':')) return text;
        try {
            const [ivHex, encryptedText] = text.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            return text; // Return original if decryption fails
        }
    }
}
