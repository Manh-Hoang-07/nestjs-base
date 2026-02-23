import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('Context & Group (Functional)', () => {
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

    describe('Context Management', () => {
        it('should list contexts', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/contexts')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should create a new context', async () => {
            // Use timestamp suffix to avoid conflicts on re-runs
            const contextCode = `test_context_${Date.now()}`;
            const newContext = {
                type: 'custom',
                name: 'Test Context',
                code: contextCode,
                status: 'active'
            };

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/contexts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newContext)
                .expect(201);

            // Response wrapped in { success, data, ... } by TransformInterceptor
            const ctx = response.body.data || response.body;
            expect(ctx.code).toBe(newContext.code);
        });
    });

    describe('Group Management', () => {
        it('should list groups', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/groups')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
        });

        it('should create a new group in a context', async () => {
            const prisma = helper.getPrisma();
            const context = await prisma.context.findFirst({ where: { code: 'system' } });

            // Use timestamp suffix to avoid conflicts on re-runs
            const groupCode = `test_group_${Date.now()}`;
            const newGroup = {
                type: 'system',
                code: groupCode,
                name: 'New System Group',
                context_id: Number(context?.id),
                status: 'active'
            };

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/groups')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newGroup)
                .expect(201);

            // Response wrapped in { success, data, ... } by TransformInterceptor
            const group = response.body.data || response.body;
            expect(group.code).toBe(newGroup.code);
        });
    });
});
