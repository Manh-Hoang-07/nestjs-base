import * as request from 'supertest';
import { TestHelper } from '../../test-helper';

describe('SystemConfig (Functional)', () => {
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

    describe('General Config', () => {
        it('should get current general config', async () => {
            const response = await request(helper.getApp().getHttpServer())
                .get('/api/admin/system-configs/general')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
            // Seed usually creates at least one config
        });

        it('should update general config', async () => {
            const updateData = {
                site_name: 'Antigravity Test Site',
                site_email: 'test@antigravity.ai'
            };

            const response = await request(helper.getApp().getHttpServer())
                .put('/api/admin/system-configs/general')  // PUT (not POST)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200); // PUT returns 200

            // Response wrapped in { success, data, ... } by TransformInterceptor
            const config = response.body.data || response.body;
            expect(config.site_name).toBe(updateData.site_name);

            // Verify in DB
            const prisma = helper.getPrisma();
            const dbConfig = await prisma.generalConfig.findFirst();
            expect(dbConfig?.site_name).toBe(updateData.site_name);
        });
    });

    describe('Email Config', () => {
        it('should get email config', async () => {
            await request(helper.getApp().getHttpServer())
                .get('/api/admin/system-configs/email')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });
});
