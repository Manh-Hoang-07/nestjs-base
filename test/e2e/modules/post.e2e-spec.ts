import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Post Module (Functional)', () => {
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

    describe('Public Post API', () => {
        it('should fetch list of posts', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/posts')
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should fetch featured posts', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/posts/featured')
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });

    describe('Admin Post API', () => {
        it('should fetch list of posts for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should create a new post', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Integration Test Post',
                    content: 'This is test content',
                    status: 'published',
                    slug: 'integration-test-post',
                })
                .expect(201); // Created

            expect(response.body.data).toBeDefined();
            expect(response.body.data.name).toBe('New Integration Test Post');
        });
    });
});
