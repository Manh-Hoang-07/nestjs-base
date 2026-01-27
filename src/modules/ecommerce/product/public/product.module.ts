import { Module } from '@nestjs/common';
import { PublicProductController } from './controllers/product.controller';
import { PublicProductService } from './services/product.service';
import { ProductRepositoryModule } from '../product.repository.module';

@Module({
  imports: [
    ProductRepositoryModule,
  ],
  controllers: [PublicProductController],
  providers: [PublicProductService],
  exports: [PublicProductService],
})
export class PublicProductModule { }