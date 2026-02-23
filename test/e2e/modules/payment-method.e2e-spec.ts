import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Payment Method Module (Functional)', () => {
    let helper: TestHelper;
    let adminToken: string;
    let createdMethodId: number;

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

        it('should create a new payment method', async () => {
            const payload = {
                name: 'E2E Test Method',
                code: 'TEST_METHOD_E2E',
                type: 'online',
                description: 'E2E payment method',
            };

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/payment-methods')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payload)
                .expect(201);

            expect(response.body.data).toBeDefined();
            expect(response.body.data.code).toBe(payload.code);
            createdMethodId = response.body.data.id;
        });

        it('should fetch a single payment method by id', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get(`/api/admin/payment-methods/${createdMethodId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBe(createdMethodId);
        });

        it('should update an existing payment method', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .put(`/api/admin/payment-methods/${createdMethodId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'E2E Test Method Updated' })
                .expect(200);

            expect(response.body.data).toBeDefined();
            expect(response.body.data.name).toBe('E2E Test Method Updated');
        });

        it('should delete a payment method', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .delete(`/api/admin/payment-methods/${createdMethodId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 204]).toContain(response.status);
        });
    });
});
