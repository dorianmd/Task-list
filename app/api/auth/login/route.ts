import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth/auth";
import { generateToken } from "@/lib/auth/jwt";

export async function POST( req: Request ){
    // Logowanie
    const body = await req.json();

    const result = await loginUser(body.email, body.password);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error },
            { status: 400 }
        );
    }

    const token = await generateToken(result.user.id, result.user.email);

    const response = NextResponse.json(
        {
            message: "success",
            user: {
                id: result.user.id,
                email: result.user.email,
            },
        },
        { status: 200 }
    );

    response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return response;
}