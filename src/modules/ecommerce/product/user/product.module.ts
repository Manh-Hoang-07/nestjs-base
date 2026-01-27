import { Module } from '@nestjs/common';
import { UserProductService } from './services/product.service';
import { UserProductController } from './controllers/product.controller';
import { ProductRepositoryModule } from '../product.repository.module';

@Module({
  imports: [
    ProductRepositoryModule,
  ],
  controllers: [
    UserProductController,
  ],
  providers: [
    UserProductService,
  ],
  exports: [
    UserProductService,
  ],
})
export class UserProductModule { }