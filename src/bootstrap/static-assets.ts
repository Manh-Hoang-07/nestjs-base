import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';

export function setupStaticAssets(app: NestExpressApplication, configService: ConfigService) {
    const appConfig = {
        corsEnabled: configService.get('app.corsEnabled', true),
        corsOrigins: configService.get('app.corsOrigins', ['*']),
    };

    const storageType = configService.get<string>('storage.type', 'local');
    if (storageType === 'local') {
        const localDestination = configService.get<string>('storage.local.destination', './storage/uploads');
        const localBaseUrl = configService.get<string>('storage.local.baseUrl', '/uploads');

        // Add CORS middleware for static files BEFORE serving them
        if (appConfig.corsEnabled) {
            const hasWildcard = appConfig.corsOrigins.includes('*');
            app.use(localBaseUrl, (req: Request, res: Response, next: NextFunction) => {
                // Set CORS headers
                if (hasWildcard) {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                } else {
                    const origin = req.headers.origin;
                    if (origin && appConfig.corsOrigins.includes(origin)) {
                        res.setHeader('Access-Control-Allow-Origin', origin);
                    } else if (appConfig.corsOrigins.length > 0) {
                        res.setHeader('Access-Control-Allow-Origin', appConfig.corsOrigins[0]);
                    }
                }
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
                // Override helmet's crossOriginResourcePolicy for static files
                res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

                // Handle preflight requests
                if (req.method === 'OPTIONS') {
                    return res.sendStatus(200);
                }
                next();
            });
        }

        // Serve static files with CORS headers in setHeaders
        app.useStaticAssets(join(process.cwd(), localDestination), {
            prefix: localBaseUrl,
            setHeaders: (res: Response) => {
                // Prevent MIME sniffing (important for uploaded content)
                res.setHeader('X-Content-Type-Options', 'nosniff');
                // Set CORS headers when serving static files
                if (appConfig.corsEnabled) {
                    const hasWildcard = appConfig.corsOrigins.includes('*');
                    if (hasWildcard) {
                        res.setHeader('Access-Control-Allow-Origin', '*');
                    }
                    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
                    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
                }
            },
        });
    }
}
