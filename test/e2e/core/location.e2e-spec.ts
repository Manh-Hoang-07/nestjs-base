import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Location (Functional)', () => {
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

    describe('Public Location API', () => {
        it('should fetch list of countries', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/location/countries')
                .expect(200);

            expect(Array.isArray(response.body.data)).toBeTruthy();
        });

        it('should fetch list of provinces', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/location/provinces')
                .expect(200);

            expect(Array.isArray(response.body.data)).toBeTruthy();
        });

        it('should fetch list of wards', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/location/wards')
                .expect(200);

            expect(Array.isArray(response.body.data)).toBeTruthy();
        });
    });

    describe('Admin Location API', () => {
        let adminToken: string;

        beforeAll(async () => {
            const loginRes = await request(helper.getApp().getHttpServer())
                .post('/api/login')
                .send({
                    email: 'systemadmin@example.com',
                    password: '12345678',
                });
            adminToken = loginRes.body.data.token;
        });

        it('should fetch list of countries for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/location/countries')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should fetch list of provinces for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/location/provinces')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });
});
