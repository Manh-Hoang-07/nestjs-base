import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module';
import { CustomLoggerService } from '@/core/logger/logger.service';
import { applyCors } from '@/bootstrap/cors';
import { applyHttpHardening } from '@/bootstrap/http-hardening';
import { applyGlobalPipes } from '@/bootstrap/pipes';
import { registerShutdown } from '@/bootstrap/shutdown';
import { setupStaticAssets } from '@/bootstrap/static-assets';
import { setupLogging } from '@/bootstrap/logging';
import { patchBigInt } from '@/bootstrap/bigint';

async function bootstrap() {
  // Patch BigInt methods
  patchBigInt();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Get configuration service
  const configService = app.get(ConfigService);

  // Use custom logger
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  // Get configuration values
  const appConfig = {
    port: configService.get('app.port', 8000),
    globalPrefix: configService.get('app.globalPrefix', 'api'),
    corsEnabled: configService.get('app.corsEnabled', true),
    corsOrigins: configService.get('app.corsOrigins', ['*']),
    environment: configService.get('app.environment', 'development'),
    name: configService.get('app.name', 'NestJS Backend'),
    version: configService.get('app.version', '1.0.0'),
    timezone: configService.get('app.timezone', 'Asia/Ho_Chi_Minh'),
  };

  // Set process timezone (best effort; DB timezone configured separately)
  try {
    process.env.TZ = appConfig.timezone;
  } catch { }

  // Configure logging based on environment
  setupLogging(appConfig.environment);

  // Enable CORS if configured
  applyCors(app, { enabled: appConfig.corsEnabled, origins: appConfig.corsOrigins });

  // HTTP hardening middlewares
  applyHttpHardening(app, '10mb');

  // Trust proxy (needed when running behind reverse proxy to get correct req.ip)
  try {
    (app as any).set('trust proxy', true);
  } catch { }

  // Set global prefix
  app.setGlobalPrefix(appConfig.globalPrefix);

  // Serve static files
  setupStaticAssets(app, configService);

  // Global validation pipe with enhanced configuration
  applyGlobalPipes(app, { production: appConfig.environment === 'production' });

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start the application
  await app.listen(appConfig.port);

  const appUrl = `http://localhost:${appConfig.port}/${appConfig.globalPrefix}`;

  logger.log(`🚀 ${appConfig.name} v${appConfig.version} is running!`, {
    environment: appConfig.environment,
    port: appConfig.port,
    url: appUrl,
    globalPrefix: appConfig.globalPrefix,
    cors: appConfig.corsEnabled,
  });

  // Graceful error and signal handling
  registerShutdown(app, logger);
}

bootstrap().catch((error) => {
  // Error starting application
  console.error('Failed to start application:', error);
  process.exit(1);
});


