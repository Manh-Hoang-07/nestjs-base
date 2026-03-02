import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { EncryptionService } from '@/common/encryption/encryption.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedProductDigitalAssets {
    constructor(private readonly prisma: PrismaService, private readonly encryptionService: EncryptionService) { }

    async seed(): Promise<void> {
        const baseDir = path.join(process.cwd(), 'src', 'core', 'database', 'json', 'ecommerce');
        const digitalProducts: any[] = JSON.parse(fs.readFileSync(path.join(baseDir, 'digital-products.json'), 'utf8'));

        const category = await this.prisma.productCategory.upsert({
            where: { slug: 'cat-san-pham-so' }, update: {}, create: { name: 'Sản phẩm số', slug: 'cat-san-pham-so', status: 'active' } as any,
        });

        for (const dp of digitalProducts) {
            const product = await this.prisma.product.upsert({
                where: { sku: dp.sku }, update: {},
                create: { name: dp.name, slug: dp.sku.toLowerCase(), sku: dp.sku, description: dp.description, short_description: dp.short_description, status: 'active', is_digital: true, is_variable: false } as any,
            });

            await this.prisma.productProductCategory.upsert({
                where: { product_id_product_category_id: { product_id: product.id, product_category_id: category.id } },
                update: {}, create: { product_id: product.id, product_category_id: category.id },
            });

            const variant = await this.prisma.productVariant.upsert({
                where: { sku: dp.sku }, update: {}, create: { product_id: product.id, name: dp.name, sku: dp.sku, price: dp.price, stock_quantity: dp.assets.length, is_active: true } as any,
            });

            for (const content of dp.assets) {
                const enc = this.encryptionService.encrypt(content);
                if (!await this.prisma.productDigitalAsset.findFirst({ where: { product_id: product.id, content: enc } })) {
                    await this.prisma.productDigitalAsset.create({ data: { product_id: product.id, product_variant_id: variant.id, content: enc, status: 'available' } });
                }
            }
        }
    }

    async clear(): Promise<void> {
        await this.prisma.productDigitalAsset.deleteMany({});
    }
}
