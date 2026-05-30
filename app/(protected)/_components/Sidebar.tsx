"use client";

import { List, LogOut, Search, Settings, Star, CalendarDays, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Tag } from "../types/index";
import { motion } from "framer-motion";

interface SidebarProps {
    tags: Tag[];
    activeTagIds: number[];
    onTagToggle: (id: number) => void;
    onClearTags: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    viewFilter?: "all" | "important" | "today" | "upcoming" | "overdue" | "completed";
    onViewFilterChange?: (v: "all" | "important" | "today" | "upcoming" | "overdue" | "completed") => void;
    onCloseMobile?: () => void;
}

export function Sidebar({
                            tags,
                            activeTagIds,
                            onTagToggle,
                            onClearTags,
                            searchQuery,
                            onSearchChange,
                            viewFilter = "all",
                            onViewFilterChange,
                            onCloseMobile,
                        }: SidebarProps) {
    const hasActiveTags = activeTagIds.length > 0;

    // Szybki handler do wylogowania
    async function handleLogout() {
        try {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            if (response.ok) {
                window.location.href = "/";
            } else {
                console.error("Błąd wylogowania serwera");
            }
        } catch (err) {
            console.error("Wystąpił błąd podczas wylogowywania:", err);
        }
    }

    return (
        <motion.aside
            initial={{ opacity: 0, x: -50, width: 0, maxWidth: 300, paddingLeft: 0, paddingRight: 0 }}
            animate={{ opacity: 1, x: 0, width: "100%", maxWidth: 300, paddingLeft: 16, paddingRight: 16 }}
            exit={{ opacity: 0, x: -50, width: 0, maxWidth: 300, paddingLeft: 0, paddingRight: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="flex h-full shrink-0 flex-col overflow-hidden lg:rounded-2xl lg:border lg:border-gray-200 bg-[#ededed] py-4 w-full"
        >
        <div className="flex items-center justify-between">
                <Link href="/" className="text-3 font-bold text-gray-800 hover:opacity-80 transition-opacity">
                    Menu
                </Link>
                <div className="flex items-center gap-2">
                    {onCloseMobile && (
                        <button onClick={onCloseMobile} className="lg:hidden rounded bg-gray-200 p-1.5 hover:bg-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                <input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-[#f6f6f6] py-2 pl-9 pr-3 text-sm text-gray-700 outline-none"
                />
            </div>

            <div className="mt-6 space-y-4 overflow-y-auto pr-1 text-sm flex-1">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Widok</p>
                    <div className="mb-3 flex flex-col gap-2">
                        <button
                            onClick={() => {
                                if (onViewFilterChange) onViewFilterChange("all");
                                onCloseMobile?.();
                            }}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                viewFilter === "all" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <List className={`h-5 w-5 ${viewFilter === "all" ? "text-white" : "text-gray-400"}`} />
                            <span>Wszystkie</span>
                        </button>

                        <button
                            onClick={() => {
                                if (onViewFilterChange) onViewFilterChange("important");
                                onCloseMobile?.();
                            }}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                viewFilter === "important" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Star className={`h-5 w-5 ${viewFilter === "important" ? "text-white" : "text-gray-400"}`} />
                            <span>Ważne</span>
                        </button>

                        <button
                            onClick={() => {
                                if (onViewFilterChange) onViewFilterChange("today");
                                onCloseMobile?.();
                            }}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                viewFilter === "today" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <CalendarDays className={`h-5 w-5 ${viewFilter === "today" ? "text-white" : "text-gray-400"}`} />
                            <span>Dzisiaj</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (onViewFilterChange) onViewFilterChange("upcoming");
                                if (onCloseMobile) onCloseMobile();
                            }}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                viewFilter === "upcoming" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Clock className={`h-5 w-5 ${viewFilter === "upcoming" ? "text-white" : "text-gray-400"}`} />
                            <span>Nadchodzące</span>
                        </button>

                        <button
                            onClick={() => {
                                if (onViewFilterChange) onViewFilterChange("overdue");
                                onCloseMobile?.();
                            }}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                viewFilter === "overdue" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <AlertCircle className={`h-5 w-5 ${viewFilter === "overdue" ? "text-white" : "text-gray-400"}`} />
                            <span>Zaległe</span>
                        </button>

                        <button
                            onClick={() => {
                                if (onViewFilterChange) onViewFilterChange("completed");
                                onCloseMobile?.();
                            }}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                viewFilter === "completed" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <CheckCircle className={`h-5 w-5 ${viewFilter === "completed" ? "text-white" : "text-gray-400"}`} />
                            <span>Skończone</span>
                        </button>
                    </div>

                    <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Tagi</p>
                    <div className="mb-3 flex flex-wrap gap-2">
                        {tags.map((tag) => {
                            const isActive = activeTagIds.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => onTagToggle(tag.id)}
                                    className="rounded-md px-2 py-1 text-xs font-medium border transition-all"
                                    style={{
                                        backgroundColor: isActive ? tag.color : `${tag.color}15`,
                                        borderColor: isActive ? tag.color : `${tag.color}30`,
                                        color: isActive ? "#fff" : tag.color
                                    }}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                    {hasActiveTags && (
                        <button onClick={onClearTags} className="text-xs font-medium text-gray-500 hover:text-gray-700">
                            Wyczyść zaznaczone tagi
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-auto border-t border-gray-200 pt-3 text-gray-600 space-y-0.5">
                <Link
                    href="/settings"
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[#e8e8e8] transition-colors cursor-default"
                >
                    <Settings className="h-4 w-4"/>Ustawienia
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="h-4 w-4"/>Wyloguj się
                </button>
            </div>
        </motion.aside>
    );
}