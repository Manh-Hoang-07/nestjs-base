import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Menus (Functional)', () => {
    let helper: TestHelper;
    let adminToken: string;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        await helper.clearDatabase();
        await helper.seedBasicData();

        const loginRes = await request(helper.getApp().getHttpServer())
            .post('/api/login')
            .send({
                email: 'systemadmin@example.com',
                password: '12345678',
            });
        adminToken = loginRes.body.data.token;
    }, 60000);

    afterAll(async () => {
        await helper.close();
    });

    describe('Public Menus', () => {
        it('should fetch public menus for guests', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/menus')
                .expect(200);

            // Response may be wrapped by TransformInterceptor or returned directly as array
            const menus = Array.isArray(response.body) ? response.body :
                Array.isArray(response.body.data) ? response.body.data : null;
            expect(menus).not.toBeNull();
        });

        it('should fetch menus for authenticated user', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/menus')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Response may be wrapped by TransformInterceptor or returned directly as array
            const menus = Array.isArray(response.body) ? response.body :
                Array.isArray(response.body.data) ? response.body.data : null;
            expect(menus).not.toBeNull();
        });
    });

    describe('Admin Menus Management', () => {
        it('should list all menus for admin', async () => {
            // Check if admin menu controller exists. Usually at /admin/menus
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/menus')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });
});
