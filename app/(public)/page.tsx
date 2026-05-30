import { cookies } from "next/headers";
import Link from "next/link";
import { ListTodo, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { verifyToken } from "@/lib/auth/jwt";

export default async function StartPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    let isAuthed = false;
    if (token) {
        const payload = await verifyToken(token);
        if (payload) {
            isAuthed = true;
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#dbe5d7] p-4 select-none">
            <main className="w-full max-w-md rounded-3xl bg-[#f4f5f4] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.14)] text-center space-y-6">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md">
                    <ListTodo className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                        Lista Zadań
                    </h1>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        {isAuthed
                            ? "Witaj z powrotem! Twoje produktywne miejsce pracy jest gotowe."
                            : "Zorganizuj swój dzień, zarządzaj subtaskami i realizuj cele w prosty sposób."
                        }
                    </p>
                </div>

                <div className="pt-2">
                    {isAuthed ? (
                        <Link
                            href="/tasks"
                            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-gray-900 active:scale-[0.98]"
                        >
                            <span>Przejdź do aplikacji</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-sky-600 active:scale-[0.98]"
                            >
                                <LogIn className="h-4 w-4" />
                                <span>Zaloguj się</span>
                            </Link>

                            <Link
                                href="/register"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3.5 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Utwórz konto</span>
                            </Link>
                        </div>
                    )}
                </div>

                <footer className="text-[11px] text-gray-400 pt-4 border-t border-gray-200/60">
                    {new Date().getFullYear()} Lista Zadań
                </footer>

            </main>
        </div>
    );
}