import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from '@/common/encryption/encryption.service';

describe('EncryptionService', () => {
    let service: EncryptionService;

    beforeEach(async () => {
        // Set a mock encryption key for testing
        process.env.ENCRYPTION_KEY = 'this-is-a-32-character-long-key-!!';

        const module: TestingModule = await Test.createTestingModule({
            providers: [EncryptionService],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('encrypt and decrypt', () => {
        it('should encrypt and then decrypt back to original text', () => {
            const originalText = 'Hello World 123';
            const encrypted = service.encrypt(originalText);

            expect(encrypted).not.toBe(originalText);
            expect(encrypted).toContain(':'); // Should have IV:Encrypted format

            const decrypted = service.decrypt(encrypted);
            expect(decrypted).toBe(originalText);
        });

        it('should return original text if input is empty for encrypt', () => {
            expect(service.encrypt('')).toBe('');
            expect((service as any).encrypt(null)).toBeNull();
        });

        it('should return original text if input is invalid for decrypt', () => {
            expect(service.decrypt('')).toBe('');
            expect(service.decrypt('invalid-format-no-colon')).toBe('invalid-format-no-colon');
        });

        it('should return original text if decryption fails (e.g. wrong key or corrupted)', () => {
            const invalidEncrypted = 'deadbeefdeadbeefdeadbeefdeadbeef:cafebabe';
            // This will likely fail decipher.final()
            const result = service.decrypt(invalidEncrypted);
            expect(result).toBe(invalidEncrypted);
        });
    });
});




