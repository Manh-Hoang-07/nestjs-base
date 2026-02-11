import { Module } from '@nestjs/common';
import { AdminProductDigitalAssetController } from './controllers/admin-product-digital-asset.controller';
import { AdminProductDigitalAssetService } from './services/admin-product-digital-asset.service';
import { ProductDigitalAssetRepositoryModule } from '../product-digital-asset.repository.module';
import { EncryptionModule } from '@/common/encryption/encryption.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [
        ProductDigitalAssetRepositoryModule,
        EncryptionModule,
        RbacModule,
    ],
    controllers: [AdminProductDigitalAssetController],
    providers: [AdminProductDigitalAssetService],
    exports: [AdminProductDigitalAssetService],
})
export class AdminProductDigitalAssetModule { }
