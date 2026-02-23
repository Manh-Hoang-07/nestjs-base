import { safeUser } from '@/modules/core/auth/utils/user.util';

describe('user.util', () => {
    describe('safeUser', () => {
        it('should remove password and remember_token', () => {
            const user = {
                id: 1,
                username: 'test',
                password: 'hashed_password',
                remember_token: 'token123',
                email: 'test@test.com'
            };

            const result = safeUser(user);

            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('remember_token');
            expect(result.username).toBe('test');
            expect(result.id).toBe(1);
        });

        it('should handle users without password or remember_token', () => {
            const user = { id: 2, name: 'Alice' };
            const result = safeUser(user as any);
            expect(result).toEqual({ id: 2, name: 'Alice' });
        });
    });
});




