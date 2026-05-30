import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prismaClient";
import { compare } from "bcrypt-ts";

export async function DELETE(req: NextRequest) {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    try {
        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Hasło jest wymagane do potwierdzenia operacji." }, { status: 400 });
        }

        const user = await prismaClient.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "Użytkownik nie istnieje." }, { status: 404 });
        }

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Podane hasło jest niepoprawne." }, { status: 400 });
        }

        await prismaClient.$transaction([
            prismaClient.task.deleteMany({ where: { userId: userId } }),

            prismaClient.user.delete({ where: { id: userId } })
        ]);

        const response = NextResponse.json({ success: true, message: "Konto usunięte." }, { status: 200 });

        response.cookies.set("auth_token", "", {
            httpOnly: true,
            expires: new Date(0),
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Błąd podczas usuwania konta:", error);
        return NextResponse.json({ error: "Wystąpił wewnętrzny błąd serwera." }, { status: 500 });
    }
}