import * as request from 'supertest';
import { TestHelper } from '../../test-helper';
import { RedisUtil } from '@/core/utils/redis.util';

describe('AuthController (Functional)', () => {
    let helper: TestHelper;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        await helper.clearDatabase();
        await helper.seedBasicData();
    }, 60000);

    afterAll(async () => {
        await helper.close();
    });

    describe('POST /api/login', () => {
        it('should login successfully with correct credentials', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .post('/api/login')
                .send({
                    email: 'systemadmin@example.com',
                    password: '12345678',
                })
                .expect(200);

            expect(response.body.data.token).toBeDefined();
            // User is not returned in this login API
            // expect(response.body.data.user).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            await request(helper.getApp().getHttpServer())
                .post('/api/login')
                .send({
                    email: 'systemadmin@example.com',
                    password: 'wrongpassword',
                })
                .expect(400);
        });
    });

    describe('POST /api/register', () => {
        it('should register a new user successfully', async () => {
            const newUser = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
                phone: '0123456789',
                otp: '123456',
                confirmPassword: 'password123'
            };

            const redis = helper.getApp().get(RedisUtil);
            await redis.set(`otp:register:${newUser.email}`, '123456', 300);

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/register')
                .send(newUser)
                .expect(201);

            expect(response.body.data.user.id).toBeDefined();
            expect(response.body.data.user.email).toBe(newUser.email);

            // Verify in DB
            const prisma = helper.getPrisma();
            const dbUser = await prisma.user.findFirst({
                where: { email: newUser.email }
            });
            expect(dbUser).toBeDefined();
            expect(dbUser?.username).toBe(newUser.username);
        });
    });

    describe('POST /api/logout', () => {
        it('should logout and clear cookie', async () => {
            // Login first
            const loginRes = await request(helper.getApp().getHttpServer())
                .post('/api/login')
                .send({
                    email: 'systemadmin@example.com',
                    password: '12345678',
                });

            const token = loginRes.body.data.token;

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/logout')
                .set('Authorization', `Bearer ${token}`)
                .expect(201); // default POST status without @HttpCode(HttpStatus.OK)

            // NestJS/Express clearCookie usually just sets the cookie to empty with an old expiry
            const cookies = response.get('Set-Cookie');
            expect(cookies?.some(c => c.includes('auth_token=;'))).toBeTruthy();
        });
    });
});
