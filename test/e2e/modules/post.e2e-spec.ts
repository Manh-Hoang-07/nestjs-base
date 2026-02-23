import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Post Module (Functional)', () => {
    let helper: TestHelper;
    let adminToken: string;
    let createdPostId: number;

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
            createdPostId = response.body.data.id;
        });
    });

    describe('Public Post Tag & Category API', () => {
        it('should fetch list of post tags', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/post-tags')
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should fetch list of post categories', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/public/post-categories')
                .expect(200);

            expect(response.body.data).toBeDefined();
        });
    });

    describe('Post Comments API', () => {
        let commentId: number;

        it('should create a comment for a post as admin (authenticated user)', async () => {
            // Ensure we have a post id, create one if previous test did not run yet
            if (!createdPostId) {
                const createPostRes = await request(helper.getApp().getHttpServer())
                    .post('/api/admin/posts')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        name: 'Comment Post',
                        content: 'Post for comments',
                        status: 'published',
                        slug: 'comment-post',
                    })
                    .expect(201);

                createdPostId = createPostRes.body.data.id;
            }

            const response = await request(helper.getApp().getHttpServer())
                .post(`/api/public/posts/${createdPostId}/comments`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    content: 'This is an E2E test comment',
                })
                .expect(201);

            expect(response.body.data).toBeDefined();
            commentId = response.body.data.id;
        });

        it('should fetch comments tree for a post', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get(`/api/public/posts/${createdPostId}/comments`)
                .expect(200);

            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBeTruthy();
        });

        it('admin should manage comments', async () => {
            // List comments in admin
            const listRes = await request(helper.getApp().getHttpServer())
                .get('/api/admin/post-comments')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(listRes.body.data).toBeDefined();

            // Get statistics
            const statsRes = await request(helper.getApp().getHttpServer())
                .get('/api/admin/post-comments/statistics')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(statsRes.body.data).toBeDefined();

            // Get single comment
            const getOneRes = await request(helper.getApp().getHttpServer())
                .get(`/api/admin/post-comments/${commentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(getOneRes.body.data).toBeDefined();

            // Update comment content
            const updateRes = await request(helper.getApp().getHttpServer())
                .put(`/api/admin/post-comments/${commentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ content: 'Updated by admin' })
                .expect(200);

            expect(updateRes.body.data).toBeDefined();

            // Update status
            await request(helper.getApp().getHttpServer())
                .put(`/api/admin/post-comments/${commentId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'hidden' })
                .expect(200);

            // Delete comment
            const deleteRes = await request(helper.getApp().getHttpServer())
                .delete(`/api/admin/post-comments/${commentId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 204]).toContain(deleteRes.status);
        });
    });
});
