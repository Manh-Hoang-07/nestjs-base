import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '@/common/core/services/base.service';
import { ProductDigitalAsset } from '@prisma/client';
import { IProductDigitalAssetRepository, PRODUCT_DIGITAL_ASSET_REPOSITORY } from '../../domain/product-digital-asset.repository';
import { EncryptionService } from '@/common/encryption/encryption.service';
import { BulkImportAssetDto } from '../dtos/bulk-import-asset.dto';

@Injectable()
export class AdminProductDigitalAssetService extends BaseService<ProductDigitalAsset, IProductDigitalAssetRepository> {
    constructor(
        @Inject(PRODUCT_DIGITAL_ASSET_REPOSITORY)
        protected readonly repository: IProductDigitalAssetRepository,
        private readonly encryptionService: EncryptionService,
    ) {
        super(repository);
    }

    async bulkImport(dto: BulkImportAssetDto) {
        const assets = dto.contents.map((content) => ({
            product_id: BigInt(dto.product_id),
            product_variant_id: dto.product_variant_id ? BigInt(dto.product_variant_id) : null,
            content: this.encryptionService.encrypt(content),
            status: 'available',
        }));

        return this.repository.createMany(assets);
    }

    protected async beforeCreate(data: any): Promise<any> {
        const payload = await super.beforeCreate(data);
        if (payload.content) {
            payload.content = this.encryptionService.encrypt(payload.content);
        }
        return payload;
    }

    protected async beforeUpdate(id: string | number | bigint, data: any): Promise<any> {
        const payload = await super.beforeUpdate(id, data);
        if (payload.content) {
            payload.content = this.encryptionService.encrypt(payload.content);
        }
        return payload;
    }

    protected transform(entity: ProductDigitalAsset): any {
        const transformed = super.transform(entity);
        if (transformed && typeof transformed === 'object') {
            try {
                return {
                    ...transformed,
                    content: this.encryptionService.decrypt(entity.content),
                };
            } catch (e) {
                return transformed;
            }
        }
        return transformed;
    }

}
