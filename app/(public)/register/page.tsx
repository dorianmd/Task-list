"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ListTodo, Mail, Lock, UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password || !confirmPassword) {
            setError("Wszystkie pola są wymagane.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Hasła nie są identyczne.");
            return;
        }

        setIsLoading(true);
        try {
            const registerResponse = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password
                }),
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                switch (registerData.error) {
                    case "email-used":
                        setError("Ten adres e-mail jest już przypisany do innego konta.");
                        break;
                    case "unknown-error":
                    default:
                        setError("Wystąpił nieznany błąd serwera. Spróbuj ponownie.");
                        break;
                }
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, 300));

            try {
                const loginResponse = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: trimmedEmail,
                        password
                    }),
                });

                if (loginResponse.ok) {
                    window.location.replace("/tasks");
                    return;
                }
            } catch (loginErr) {
                console.error("Błąd podczas automatycznego logowania:", loginErr);
            }

            window.location.replace("/login?registered=true");
        } catch {
            setError("Wystąpił błąd połączenia. Spróbuj ponownie później.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#dbe5d7] p-4 select-none">
            <main className="w-full max-w-lg rounded-3xl bg-[#f4f5f4] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.14)] space-y-6">

                <div className="text-center space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-sm mb-2">
                        <ListTodo className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dołącz do nas</h1>
                    <p className="text-xs text-gray-500">Stwórz darmowe konto i zacznij działać</p>
                </div>

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

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Powtórz hasło</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (error) setError(null);
                                }}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-sky-500 transition-colors"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

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
                        <UserPlus className="h-4 w-4" />
                        <span>{isLoading ? "Tworzenie konta..." : "Zarejestruj się"}</span>
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-gray-200/60">
                    <p className="text-xs text-gray-500">
                        Masz już konto?{" "}
                        <Link href="/login" className="font-semibold text-sky-500 hover:text-sky-600 inline-flex items-center gap-0.5 group">
                            Zaloguj się <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </p>
                </div>

            </main>
        </div>
    );
}