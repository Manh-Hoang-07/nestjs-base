import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('ProfileController (Functional)', () => {
    let helper: TestHelper;
    let authToken: string;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();

        // 1. Dọn dẹp và seed dữ liệu "như thật"
        await helper.clearDatabase();
        await helper.seedBasicData();

        // 2. Login để lấy token thực tế
        const loginResponse = await request(helper.getApp().getHttpServer())
            .post('/api/login')
            .send({
                email: 'systemadmin@example.com',
                password: '12345678',
            });

        authToken = loginResponse.body.data.token;
    }, 60000); // Tăng timeout cho việc seeding

    afterAll(async () => {
        await helper.close();
    });

    describe('GET /api/user/profile', () => {
        it('should return the profile of the current authenticated user', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Kiểm tra dữ liệu trả về "như thật"
            expect(response.body).toBeDefined();
            // Response được bọc trong { success, data, message, meta } bởi TransformInterceptor
            const profile = response.body.data || response.body;
            expect(profile.email).toBe('systemadmin@example.com');
            expect(profile.username).toBe('systemadmin');
            // Vì là functional test, dữ liệu này đến trực tiếp từ Database
        });

        it('should return 401 or 403 if no token is provided', async () => {
            const res = await request(helper.getApp().getHttpServer())
                .get('/api/user/profile');
            // JwtAuthGuard returns false (no throw) → NestJS converts to 403 Forbidden
            // Or RbacGuard throws 401 Unauthorized depending on guard execution order
            expect([401, 403]).toContain(res.status);
        });
    });

    describe('PATCH /api/user/profile', () => {
        it('should update the user profile in the database', async () => {
            const newName = 'System Admin Updated';
            const newBirthday = '1990-01-01';

            const response = await request(helper.getApp().getHttpServer())
                .patch('/api/user/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: newName,
                    birthday: newBirthday,
                    gender: 'male',
                    about: 'I am a real system admin',
                })
                .expect(200);

            // 1. Kiểm tra response
            // Response được bọc trong { success, data, ... } bởi TransformInterceptor
            const updatedProfile = response.body.data || response.body;
            expect(updatedProfile.name).toBe(newName);

            // 2. Kiểm tra trực tiếp trong Database để đảm bảo tính functional
            const prisma = helper.getPrisma();
            const dbUser = await prisma.user.findFirst({
                where: { email: 'systemadmin@example.com' },
                include: { profile: true }
            });

            expect(dbUser?.name).toBe(newName);
            expect(dbUser?.profile?.about).toBe('I am a real system admin');
        });
    });
});
