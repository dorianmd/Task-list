"use client";

import { useState } from "react";
import { Lock, Trash2, ShieldAlert, Eye, EyeOff, Save, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Wszystkie pola są wymagane.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Nowe hasła nie są identyczne.");
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setPasswordError(data.error || "Wystąpił błąd podczas zmiany hasła.");
                return;
            }

            setPasswordSuccess("Hasło zostało pomyślnie zmienione!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            setPasswordError("Błąd połączenia z serwerem.");
        } finally {
            setPasswordLoading(false);
        }
    }

    async function handleDeleteAccount(e: React.FormEvent) {
        e.preventDefault();
        setDeleteError(null);

        if (!deletePassword) {
            setDeleteError("Musisz podać hasło, aby potwierdzić usunięcie konta.");
            return;
        }

        const finalConfirm = window.confirm("CZY NA PEWNO CHCESZ TRWALE USUNĄĆ KONTO? Te operacji nie można cofnąć, a wszystkie Twoje zadania zostaną bezpowrotnie skasowane.");
        if (!finalConfirm) return;

        setDeleteLoading(true);
        try {
            const response = await fetch("/api/user/delete-account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: deletePassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setDeleteError(data.error || "Niepoprawne hasło.");
                return;
            }

            window.location.href = "/";
        } catch {
            setDeleteError("Błąd połączenia z serwerem.");
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="h-screen overflow-hidden bg-[#dbe5d7] p-3">
            <main className="mx-auto flex h-full w-full max-w-screen gap-4 rounded-3xl bg-[#f4f5f4] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.14)] overflow-y-auto">
                <section className="mx-auto max-w-2xl w-full space-y-6 py-4">

                    <header className="mb-6 flex items-start gap-4">
                        <Link
                            href="/tasks"
                            className="mt-1.5 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                            title="Powrót do zadań"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Konfiguracja profilu</p>
                            <h1 className="text-4xl font-bold text-gray-800">Ustawienia konta</h1>
                        </div>
                    </header>

                    <div className="rounded-2xl border border-gray-200 bg-[#f8f8f8] p-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-5">
                            <Lock className="h-5 w-5 text-gray-600" />
                            <h2 className="text-xl font-bold text-gray-800">Zmiana hasła</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Aktualne hasło</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-sky-500 transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Nowe hasło</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-sky-500 transition-colors"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Potwierdź nowe hasło</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-sky-500 transition-colors"
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
                            </div>

                            <AnimatePresence>
                                {passwordError && (
                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-600 font-medium">
                                        {passwordError}
                                    </motion.p>
                                )}
                                {passwordSuccess && (
                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-green-600 font-medium">
                                        {passwordSuccess}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <Save className="h-4 w-4" />
                                    {passwordLoading ? "Aktualizowanie..." : "Zapisz nowe hasło"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-red-200 pb-4 mb-4">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            <h2 className="text-xl font-bold text-red-800">Strefa zagrożenia</h2>
                        </div>

                        <p className="text-sm text-red-700 mb-4">
                            Usunięcie konta spowoduje bezpowrotne skasowanie wszystkich Twoich zadań oraz tagów. Tej operacji nie można cofnąć.
                        </p>

                        {!isDeleteOpen ? (
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
                            >
                                <ShieldAlert className="h-4 w-4" />
                                Chcę usunąć konto
                            </button>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleDeleteAccount}
                                className="space-y-4 rounded-xl border border-red-200 bg-white p-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-red-800 mb-1">
                                        Potwierdź swoim hasłem:
                                    </label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="w-full max-w-md rounded-md border border-red-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors"
                                        placeholder="Wpisz hasło konta"
                                    />
                                    {deleteError && (
                                        <p className="text-xs text-red-600 font-medium mt-1">{deleteError}</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={deleteLoading}
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-400"
                                    >
                                        {deleteLoading ? "Usuwanie..." : "Potwierdź trwałe usunięcie"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDeleteOpen(false);
                                            setDeletePassword("");
                                            setDeleteError(null);
                                        }}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Anuluj
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>

                </section>
            </main>
        </div>
    );
}