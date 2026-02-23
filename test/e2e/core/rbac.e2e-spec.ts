import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('RBAC (Functional)', () => {
    let helper: TestHelper;
    let adminToken: string;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        await helper.clearDatabase();
        await helper.seedBasicData();

        // Login as system admin to get token
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

    describe('Roles Management', () => {
        it('should list roles for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/roles')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body.data)).toBeTruthy();
            expect(response.body.data.some((r: any) => r.code === 'system')).toBeTruthy();
        });

        it('should create a new role', async () => {
            // Use timestamp suffix to avoid conflicts on re-runs
            const roleCode = `test_role_${Date.now()}`;
            const newRole = {
                code: roleCode,
                name: 'Test Role',
                status: 'active'
            };

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/roles')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newRole)
                .expect(201);

            // Response wrapped in { success, data, ... } by TransformInterceptor
            const role = response.body.data || response.body;
            expect(role.code).toBe(newRole.code);

            // Verify in DB
            const prisma = helper.getPrisma();
            const dbRole = await prisma.role.findFirst({
                where: { code: roleCode }
            });
            expect(dbRole).toBeDefined();
        });
    });

    describe('Permissions Management', () => {
        it('should list permissions', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/permissions')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body.data)).toBeTruthy();
        });

        it('should create a new permission', async () => {
            // Use timestamp suffix to avoid conflicts on re-runs
            const permCode = `test.permission.${Date.now()}`;
            const newPermission = {
                code: permCode,
                name: 'Test Permission',
                scope: 'system'
            };

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/permissions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newPermission)
                .expect(201);

            // Response wrapped in { success, data, ... } by TransformInterceptor
            const perm = response.body.data || response.body;
            expect(perm.code).toBe(newPermission.code);
        });
    });
});
