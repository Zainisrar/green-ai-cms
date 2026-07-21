import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/boxed-signin'];
    
    // API routes that don't require authentication
    const publicApiRoutes = ['/api/auth/login', '/api/auth/create-super-admin'];
    
    // Check if it's a public route
    if (publicRoutes.includes(pathname) || publicApiRoutes.includes(pathname)) {
        return NextResponse.next();
    }
    

    
    // Allow root path to handle its own authentication logic
    if (pathname === '/') {
        return NextResponse.next();
    }
    
    // Check for authentication token
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no token and trying to access protected route, redirect to login
    if (!token && (pathname.startsWith('/navigation') || pathname.startsWith('/users') || pathname.startsWith('/enlighten') || pathname.startsWith('/ecosystem') || pathname.startsWith('/empower') || pathname.startsWith('/engage') || pathname.startsWith('/endeavors'))) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Only protect specific API routes that need authentication (POST/PUT/DELETE operations)
    const protectedApiRoutes = ['/api/users', '/api/roles'];
    const needsApiAuth = protectedApiRoutes.some(route => pathname.startsWith(route));
    
    // For /api/navigation, only protect non-GET requests
    if (pathname.startsWith('/api/navigation')) {
        if (!token && request.method !== 'GET') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
    } else if (!token && needsApiAuth) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};