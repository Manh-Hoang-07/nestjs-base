import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('IAM User Admin (Functional)', () => {
    let helper: TestHelper;
    let adminToken: string;
    let testUserId: number | bigint;

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

    describe('GET /api/admin/users', () => {
        it('should list users for admin', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBeTruthy();
        });
    });

    describe('POST /api/admin/users', () => {
        it('should create a new user with profile', async () => {
            const newUser = {
                username: 'test_admin_user',
                email: 'test_admin@example.com',
                password: 'password123',
                name: 'Test Admin User',
                profile: {
                    gender: 'male',
                    address: 'Test Address'
                }
            };

            const response = await request(helper.getApp().getHttpServer())
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser)
                .expect(201);

            expect(response.body.data.email).toBe(newUser.email);
            testUserId = response.body.data.id;

            // Verify DB
            const prisma = helper.getPrisma();
            const dbUser = await prisma.user.findFirst({
                where: { email: newUser.email },
                include: { profile: true }
            });
            expect(dbUser).toBeDefined();
            expect(dbUser?.profile?.address).toBe('Test Address');
        });
    });

    describe('PUT /api/admin/users/:id/roles', () => {
        it('should sync roles for a user in a group', async () => {
            const prisma = helper.getPrisma();
            const user = await prisma.user.findFirst({ where: { id: BigInt(testUserId) } });
            const group = await prisma.group.findFirst({ where: { code: 'shop1' } });

            const role = await prisma.role.findFirst({ where: { code: 'shop_admin' } });

            expect(user).toBeDefined();
            expect(group).toBeDefined();
            expect(role).toBeDefined();

            // Ensure the roleContext exists to pass API validation
            const roleContextExists = await prisma.roleContext.findFirst({
                where: { role_id: role!.id, context_id: group!.context_id }
            });
            if (!roleContextExists) {
                await prisma.roleContext.create({
                    data: {
                        role_id: role!.id,
                        context_id: group!.context_id
                    }
                });
            }

            expect(user).toBeDefined();
            expect(group).toBeDefined();
            expect(role).toBeDefined();

            // Add user to the group first
            await prisma.userGroup.create({
                data: {
                    user_id: user!.id,
                    group_id: group!.id,
                }
            });

            const response = await request(helper.getApp().getHttpServer())
                .put(`/api/admin/users/${user?.id}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .set('X-Group-Id', group?.id.toString() || '') // Custom header for GroupInterceptor
                .send({
                    role_ids: [Number(role?.id)]
                })
                .expect(200);

            // Verify role assignment in DB
            const assignment = await prisma.userRoleAssignment.findFirst({
                where: {
                    user_id: user?.id,
                    group_id: group?.id,
                    role_id: role?.id
                }
            });
            expect(assignment).toBeDefined();
        });
    });
});
