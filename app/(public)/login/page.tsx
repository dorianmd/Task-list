"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ListTodo, Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password) {
            setError("Wszystkie pola są wymagane.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error != 'invalid-credentials') {
                    setError(data.error);
                } else {
                    setError("Niepoprawny e-mail lub hasło.");
                }
                return;
            }
            window.location.href = "/tasks";
        } catch {
            setError("Błąd połączenia z serwerem. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#dbe5d7] p-4 select-none">
            <main className="w-full max-w-md rounded-3xl bg-[#f4f5f4] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.14)] space-y-6">

                {/* Logo & Nagłówek */}
                <div className="text-center space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-sm mb-2">
                        <ListTodo className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Witaj ponownie</h1>
                    <p className="text-xs text-gray-500">Zaloguj się, aby zarządzać swoimi zadaniami</p>
                </div>

                {/* Formularz */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Adres E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError(null);
                                }}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 transition-colors"
                                placeholder="twoj@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hasło</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(null);
                                }}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-sky-500 transition-colors"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Animowany Error Box */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-sky-600 active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <LogIn className="h-4 w-4" />
                        <span>{isLoading ? "Logowanie..." : "Zaloguj się"}</span>
                    </button>
                </form>

                {/* Przekierowanie do Rejestracji */}
                <div className="text-center pt-2 border-t border-gray-200/60">
                    <p className="text-xs text-gray-500">
                        Nie masz jeszcze konta?{" "}
                        <Link href="/register" className="font-semibold text-sky-500 hover:text-sky-600 inline-flex items-center gap-0.5 group">
                            Zarejestruj się <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </p>
                </div>

            </main>
        </div>
    );
}