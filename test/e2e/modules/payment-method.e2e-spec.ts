import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Payment Method Module (Functional)', () => {
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

    describe('Public Payment Method API', () => {
        it('should fetch list of active payment methods', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/payment-methods')
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });

    describe('Admin Payment Method API', () => {
        it('should fetch list of payment methods for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/payment-methods')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });
});
