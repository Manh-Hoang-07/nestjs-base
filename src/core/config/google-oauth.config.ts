import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuth', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://127.0.0.1:8000/api/auth/google/callback',
  frontendUrl: process.env.GOOGLE_FRONTEND_URL || 'http://localhost:3000',
}));


