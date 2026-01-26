import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

// Core Technical Modules (Infrastructure)
import { CoreModule } from '@/core/core.module';
import { CommonModule } from '@/common/common.module';
import { CustomLoggerService } from '@/core/logger/logger.service';

// Filter, Interceptors, Guards
import { HttpExceptionFilter, QueryFailedFilter } from '@/common/http/filters';
import {
  TransformInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
  GroupInterceptor
} from '@/common/http/interceptors';
import { FilePathInterceptor } from '@/common/file/interceptors';
import { JwtAuthGuard, RbacGuard } from '@/common/auth/guards';
import { RequestContextMiddleware } from '@/common/http/middlewares';
import { RateLimitModule } from '@/core/security/throttler.module';

// Business Logic Aggregate Modules
import { CoreModulesModule } from '@/modules/core/core.module';
import { IntroductionModule } from '@/modules/introduction/introduction.module';

// Other Domain Modules
import { PostModule } from '@/modules/post/post.module';
import { EnumModule } from '@/shared/enums';
import { FileUploadModule } from '@/modules/storage/file-upload/file-upload.module';
import { MarketingModule } from '@/modules/marketing/marketing.module';
import { AppMailModule } from '@/core/mail/mail.module';
import { HomepageModule } from '@/modules/homepage/homepage.module';

@Module({
  imports: [
    CoreModule,
    CommonModule,
    ScheduleModule.forRoot(),
    RateLimitModule,

    // Business Logic Modules
    CoreModulesModule,
    IntroductionModule,

    // Remaining Independent Modules
    PostModule,
    MarketingModule,
    EnumModule,
    FileUploadModule,
    AppMailModule,
    HomepageModule,
  ],
  controllers: [],
  providers: [
    CustomLoggerService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: QueryFailedFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: FilePathInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: GroupInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
