import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/apps", "/builder", "/run", "/connectors"];

// Routes that are only for unauthenticated users
const authRoutes = ["/login", "/register"];

// All valid routes (for catch-all redirect)
const validRoutes = [...protectedRoutes, ...authRoutes, "/"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token (check if user is authenticated)
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthenticated = !!token;

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if the current path is a valid route
    const isValidRoute = validRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) || pathname === "/";

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && isProtectedRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access auth routes
    if (isAuthenticated && isAuthRoute) {
        return NextResponse.redirect(new URL("/apps", request.url));
    }

    // If route is not valid (unknown route), redirect appropriately
    if (!isValidRoute) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL("/apps", request.url));
        } else {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
    ],
};
