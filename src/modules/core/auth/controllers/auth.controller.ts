import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from '@/modules/core/auth/services/auth.service';
import { LoginDto } from '@/modules/core/auth/dto/login.dto';
import { RegisterDto } from '@/modules/core/auth/dto/register.dto';
import { RefreshTokenDto } from '@/modules/core/auth/dto/refresh-token.dto';
import { ForgotPasswordDto } from '@/modules/core/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/modules/core/auth/dto/reset-password.dto';
import { SendOtpDto } from '@/modules/core/auth/dto/send-otp.dto';
import { Auth } from '@/common/auth/utils';
import { Permission } from '@/common/auth/decorators';
import { LogRequest } from '@/common/shared/decorators';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @LogRequest({ fileBaseName: 'auth_login' })
  @Permission('public')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    if (result?.token) {
      const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
      res.cookie('auth_token', result.token, { maxAge: 60 * 60 * 1000, httpOnly: false, secure: false, domain, path: '/' });
    }
    return result;
  }

  @LogRequest({ fileBaseName: 'auth_register' })
  @Permission('public')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Permission('public')
  @Post('logout')
  async logout(@Headers('authorization') authHeader: string, @Res({ passthrough: true }) res: Response) {
    const userId = Auth.id(undefined) as number;
    // Extract token from authorization header
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    await this.authService.logout(userId, token || undefined);
    const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
    res.clearCookie('auth_token', { domain, path: '/' });
    return null;
  }

  @Permission('public')
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshTokenByValue(dto.refreshToken);

    if (result?.token) {
      const domain = (res.req.hostname === 'localhost') ? 'localhost' : undefined;
      res.cookie('auth_token', result.token, { maxAge: 60 * 60 * 1000, httpOnly: false, secure: false, domain, path: '/' });
    }
    return result;
  }

  @LogRequest({ fileBaseName: 'auth_forgot_password' })
  @Permission('public')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute (more restrictive for password reset)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @LogRequest({ fileBaseName: 'auth_reset_password' })
  @Permission('public')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute (more restrictive for password reset)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @LogRequest({ fileBaseName: 'auth_register_send_otp' })
  @Permission('public')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // Max 2 emails per minute
  @Post('register/send-otp')
  async registerSendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtpForRegister(dto);
  }

  @LogRequest({ fileBaseName: 'auth_forgot_password_send_otp' })
  @Permission('public')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // Max 2 emails per minute
  @Post('forgot-password/send-otp')
  async forgotPasswordSendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtpForForgotPassword(dto);
  }

  @LogRequest({ fileBaseName: 'auth_google' })
  @Permission('public')
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @LogRequest({ fileBaseName: 'auth_google_callback' })
  @Permission('public')
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.authService.handleGoogleAuth(user);

    if (result?.token) {
      const frontendUrl = this.configService.get<string>('googleOAuth.frontendUrl') || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/google/callback?token=${result.token}&refreshToken=${result.refreshToken}&expiresIn=${result.expiresIn}`;
      return res.redirect(redirectUrl);
    }

    return res.redirect(this.configService.get<string>('googleOAuth.frontendUrl') + '/login?error=auth_failed');
  }
}
