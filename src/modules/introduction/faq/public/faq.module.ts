import { Module } from '@nestjs/common';
import { PublicFaqService } from '@/modules/introduction/faq/public/services/faq.service';
import { PublicFaqController } from '@/modules/introduction/faq/public/controllers/faq.controller';
import { FaqRepositoryModule } from '../faq.repository.module';

@Module({
  imports: [FaqRepositoryModule],
  controllers: [PublicFaqController],
  providers: [PublicFaqService],
  exports: [PublicFaqService],
})
export class PublicFaqModule { }

