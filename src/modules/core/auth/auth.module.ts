import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '@/modules/core/auth/services/auth.service';
import { AuthController } from '@/modules/core/auth/controllers/auth.controller';
import jwtConfig from '@/core/config/jwt.config';
import googleOAuthConfig from '@/core/config/google-oauth.config';
import { JwtStrategy } from '@/modules/core/auth/strategies/jwt.strategy';
import { GoogleStrategy } from '@/modules/core/auth/strategies/google.strategy';
import { TokenService } from '@/modules/core/auth/services/token.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { AppMailModule } from '@/core/mail/mail.module';
import { BullModule } from '@nestjs/bull';

import { ContentTemplateAdminModule } from '@/modules/core/content-template/admin/content-template.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleOAuthConfig),
    RbacModule,
    AppMailModule,
    ContentTemplateAdminModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          // jsonwebtoken@9 has stricter typings for expiresIn
          expiresIn: (configService.get<string>('jwt.expiresIn') || '60m') as any,
          issuer: configService.get<string>('jwt.issuer'),
          audience: configService.get<string>('jwt.audience'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule { }


