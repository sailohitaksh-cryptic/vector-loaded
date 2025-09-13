// middleware.ts

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // This matcher ensures the middleware runs on all routes except for static files,
  // images, and the Next.js API routes.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};