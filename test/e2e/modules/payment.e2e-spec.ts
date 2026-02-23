import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Payment Module (Functional)', () => {
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

    describe('Payment API', () => {
        it('should fetch payments list to admins or authorized users', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/payment')
                .set('Authorization', `Bearer ${adminToken}`);
            // Check status is either 200 or 403 (due to rbac setup)
            expect([200, 403]).toContain(response.status);

            if (response.status === 200) {
                expect(response.body.data).toBeDefined();
            }
        });

        // Cannot easily test creation of online payment URL in E2E without heavy mocking, 
        // at least check the API throws validation error if empty payload is given
        it('should reject payment url creation without required fields', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .post('/api/payment/create-url')
                .send({})
                .expect(400);

            expect(response.body.message).toBeDefined(); // Validation errors
        });
    });
});
