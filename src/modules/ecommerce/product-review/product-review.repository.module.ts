import { Module } from '@nestjs/common';
import { REVIEW_REPOSITORY } from './domain/review.repository';
import { ReviewRepositoryImpl } from './infrastructure/repositories/review.repository.impl';
import { PrismaModule } from '@/core/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: REVIEW_REPOSITORY,
            useClass: ReviewRepositoryImpl,
        },
    ],
    exports: [REVIEW_REPOSITORY],
})
export class ProductReviewRepositoryModule { }
