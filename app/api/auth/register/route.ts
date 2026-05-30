import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/auth";

export async function POST( req: Request ) {
        const body = await req.json();

        const user = await registerUser(body.email, body.password);

        if (user.success) {
            return NextResponse.json({message: "success"}, {status: 200});
        } else {
            return NextResponse.json({ error: user.error }, { status: 400 });
    }
}