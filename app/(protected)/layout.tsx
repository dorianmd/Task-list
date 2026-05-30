import { ReactNode } from "react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/app/auth/AuthProvider";

export default async function ProtectedPagesLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies(); // synchronous read only
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return redirect("/login");

    const payload = await verifyToken(token);
    if (!payload) return redirect("/login");

    return (
        <AuthProvider session={payload}>
            <div className="app-structure">{children}</div>
        </AuthProvider>
    );
}
