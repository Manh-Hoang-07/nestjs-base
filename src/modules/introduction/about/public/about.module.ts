import { Module } from '@nestjs/common';
import { PublicAboutService } from '@/modules/introduction/about/public/services/about.service';
import { PublicAboutController } from '@/modules/introduction/about/public/controllers/about.controller';
import { AboutRepositoryModule } from '@/modules/introduction/about/about.repository.module';

@Module({
  imports: [AboutRepositoryModule],
  controllers: [PublicAboutController],
  providers: [PublicAboutService],
  exports: [PublicAboutService],
})
export class PublicAboutModule { }

