import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateToken } from "@/lib/auth/jwt";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;
    const { pathname } = request.nextUrl;
    const isApiRequest = pathname.startsWith("/api");

    if (!token) {
        if (isApiRequest) {
            return NextResponse.json({ error: "Unauthorized: Missing auth token" }, { status: 401 });
        }
        if (pathname === "/login" || pathname === "/register") {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
        if (isApiRequest) {
            return NextResponse.json({ error: "Unauthorized: Session expired" }, { status: 401 });
        }
        if (pathname === "/login" || pathname === "/register") {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/login" || pathname === "/register") {
        return NextResponse.redirect(new URL("/tasks", request.url));
    }

    // Refresh tokenu - jeśli do wygaśnięcia sesji zostało mniej niż 3 dni, generujemy nowy token.
    const now = Math.floor(Date.now() / 1000);
    const threeDays = 3 * 24 * 60 * 60;
    const exp = payload.exp as number;
    const timeLeft = exp - now;

    // Przekazanie wylistowanego User ID w bezpiecznych nagłówkach wewnętrznych
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);

    if (timeLeft < threeDays) {
        const newToken = await generateToken(payload.userId, payload.email);
        const res = NextResponse.next({
            request: { headers: requestHeaders }
        });

        res.cookies.set({
            name: "auth_token",
            value: newToken,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
        return res;
    }

    return NextResponse.next({
        request: { headers: requestHeaders }
    });
}

export const config = {
    matcher: [
        "/login",
        "/register",
        "/tasks/:path*",
        "/dashboard/:path*",
        "/api/tasks/:path*",
        "/api/user/:path*"
    ],
};