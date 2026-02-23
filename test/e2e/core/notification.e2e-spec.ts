import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Notification & Content Template (Functional)', () => {
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

    describe('Admin Notification Management', () => {
        it('should list notifications for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });

    describe('User Notifications', () => {
        it('should list my notifications', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/user/notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body.data)).toBeTruthy();
        });
    });

    describe('Content Templates', () => {
        it('should list content templates', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/content-templates')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should create a new content template', async () => {
            // Use timestamp suffix to avoid conflicts on re-runs
            const templateCode = `test_welcome_${Date.now()}`;
            const newTemplate = {
                code: templateCode,
                name: 'Test Welcome Email',
                category: 'render',
                type: 'email',
                content: '<p>Hello {{name}}</p>',
                metadata: {
                    subject: 'Welcome to our platform'
                },
                status: 'active'
            };

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/content-templates')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newTemplate)
                .expect(201);

            // Response wrapped in { success, data, ... } by TransformInterceptor
            const template = response.body.data || response.body;
            expect(template.code).toBe(newTemplate.code);
        });
    });
});
