import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes - accessible to everyone
const isPublicRoute = createRouteMatcher([
  '/', 
  '/about',
  '/publicPage',
        // login, register, etc.
]);

// Private routes - accessible only if logged in
const isPrivateRoute = createRouteMatcher([
  '/profile(.*)',
  '/payment(.*)',
  "/chat(.*)",

]);

// Admin routes - accessible only if logged in + role === 'admin'
const isAdminRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // ✅ Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 🛡️ Protect admin routes
  if (isAdminRoute(req)) {
    if (!userId || sessionClaims?.metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // 🔐 Protect private routes
  if (isPrivateRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Optional: block all other undefined routes
  // return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
