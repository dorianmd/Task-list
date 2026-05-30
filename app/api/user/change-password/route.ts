import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prismaClient";
import { compare, hash } from "bcrypt-ts";

export async function POST(req: NextRequest) {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Wszystkie pola są wymagane." }, { status: 400 });
        }

        const user = await prismaClient.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "Użytkownik nie istnieje." }, { status: 404 });
        }

        const isMatch = await compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Aktualne hasło jest niepoprawne." }, { status: 400 });
        }

        const hashedPassword = await hash(newPassword, 10);

        await prismaClient.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Błąd podczas zmiany hasła:", error);
        return NextResponse.json({ error: "Wystąpił wewnętrzny błąd serwera." }, { status: 500 });
    }
}