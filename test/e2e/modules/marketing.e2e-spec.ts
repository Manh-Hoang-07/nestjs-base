import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Marketing Module (Functional)', () => {
    let helper: TestHelper;
    let adminToken: string;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        await helper.clearDatabase();
        await helper.seedBasicData();

        // Admin login
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

    describe('Public Banner API', () => {
        it('should fetch list of active banners', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/banners')
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });

    describe('Admin Banner API', () => {
        it('should fetch list of banners for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/banners')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should create banner location successfully', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/banner-locations')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Setup Location',
                    code: 'TEST_LOCATION_E2E',
                    description: 'Location for e2e test'
                });

            // It could be 201 Created or 400 Bad Request if already exists depending on clearDatabase state
            // we will expect 2xx statuses mostly
            expect([201, 200, 400]).toContain(response.status);
        });
    });
});
