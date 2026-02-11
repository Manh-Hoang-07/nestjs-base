import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { EncryptionService } from '@/common/encryption/encryption.service';

@Injectable()
export class SeedProductDigitalAssets {
    private readonly logger = new Logger(SeedProductDigitalAssets.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
    ) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding digital product assets (accounts, keys)...');

        // 1. Create a Digital Product Category
        const category = await this.prisma.productCategory.upsert({
            where: { slug: 'cat-san-pham-so' },
            update: {},
            create: {
                name: 'Sản phẩm số',
                slug: 'cat-san-pham-so',
                status: 'active',
            } as any,
        });

        // 2. Create Digital Products
        const digitalProducts = [
            {
                name: 'Tài khoản Netflix Premium 1 Tháng',
                sku: 'NETFLIX-PRE-1M',
                price: 65000,
                assets: [
                    'user1@example.com|pass123',
                    'user2@example.com|abc456',
                    'user3@example.com|secure789',
                    'user4@example.com|password123',
                    'user5@example.com|topsecret99',
                ]
            },
            {
                name: 'Windows 11 Pro License Key',
                sku: 'WIN11PRO-KEY',
                price: 150000,
                assets: [
                    'W269N-WFGWX-YVC9B-4J6C9-T83GX',
                    'MH37W-N47XK-V7XM9-C7227-GCQG9',
                    'NRG8B-VKK3Q-UXVJ-H67TR-A42G6',
                    '9FNHH-K3HBT-3W4TD-6383H-6XYWF',
                    '6TP4R-GNPTD-KYYHQ-7B7DP-J447Y',
                ]
            }
        ];

        for (const dp of digitalProducts) {
            // Create product
            const product = await this.prisma.product.upsert({
                where: { sku: dp.sku },
                update: {},
                create: {
                    name: dp.name,
                    slug: dp.sku.toLowerCase(),
                    sku: dp.sku,
                    description: `Bản quyền ${dp.name} chính hãng.`,
                    short_description: `Mua ${dp.name} giá rẻ.`,
                    status: 'active',
                    is_digital: true,
                    is_variable: false,
                } as any,
            });

            // Link category
            await this.prisma.productProductCategory.upsert({
                where: {
                    product_id_product_category_id: {
                        product_id: product.id,
                        product_category_id: category.id,
                    }
                },
                update: {},
                create: {
                    product_id: product.id,
                    product_category_id: category.id,
                }
            });

            // Create a default variant if not exist
            const variant = await this.prisma.productVariant.upsert({
                where: { sku: dp.sku },
                update: {},
                create: {
                    product_id: product.id,
                    name: dp.name,
                    sku: dp.sku,
                    price: dp.price,
                    stock_quantity: dp.assets.length,
                    is_active: true,
                } as any,
            });

            // 3. Create Digital Assets (Encrypted)
            for (const content of dp.assets) {
                const encryptedContent = this.encryptionService.encrypt(content);

                // Check if asset already exists (simple content check)
                const existing = await this.prisma.productDigitalAsset.findFirst({
                    where: {
                        product_id: product.id,
                        content: encryptedContent,
                    }
                });

                if (!existing) {
                    await this.prisma.productDigitalAsset.create({
                        data: {
                            product_id: product.id,
                            product_variant_id: variant.id,
                            content: encryptedContent,
                            status: 'available',
                        }
                    });
                }
            }

            this.logger.log(`Inserted ${dp.assets.length} assets for ${dp.name}`);
        }

        this.logger.log('Digital product assets seeding completed');
    }
}
