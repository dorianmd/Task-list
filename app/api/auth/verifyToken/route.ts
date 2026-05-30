import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateToken, verifyToken } from "@/lib/auth/jwt";

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ error: "unauthorized: no token found" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: "unauthorized: auth_token is incorrect" }, { status: 401 });
    }

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp! - now;
    const threeDays = 3 * 24 * 60 * 60;

    if (timeLeft < threeDays) {
        const newToken = await generateToken(payload.userId, payload.email);

        cookieStore.set("auth_token", newToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })
    }

    return NextResponse.json(payload, {status: 200});
}