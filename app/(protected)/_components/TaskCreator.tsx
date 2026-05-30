"use client";

import { FormEvent, useState, useRef, useEffect, useMemo } from "react";
import { Check, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DateTimePickerField from "./DateTimePickerField";
import { Task, Tag } from "../types/index";

interface TaskCreatorProps {
    onTaskCreated?: (task: Task) => void;
    availableTags: Tag[];
}

export function TaskCreator({ onTaskCreated, availableTags = [] }: TaskCreatorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    const [customTags, setCustomTags] = useState<Tag[]>([]);

    const tagsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                isTagsOpen &&
                tagsContainerRef.current &&
                !tagsContainerRef.current.contains(event.target as Node)
            ) {
                setIsTagsOpen(false);
                setSearchQuery("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isTagsOpen]);

    const allTagOptions = useMemo(() => {
        const merged = [...availableTags, ...customTags];
        return Array.from(new Map(merged.map((tag) => [tag.id || tag.name, tag])).values());
    }, [availableTags, customTags]);

    const filteredTags = useMemo(() => {
        return allTagOptions.filter((tag) =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allTagOptions, searchQuery]);

    const tagExists = useMemo(() => {
        return allTagOptions.some(
            (t) => t.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );
    }, [allTagOptions, searchQuery]);

    const isTitleError = !!(error && /tytuł/i.test(error));
    const isDeadlineError = !!(error && /(termin|deadline)/i.test(error));

    function handleToggleTag(tag: Tag) {
        const isSelected = selectedTags.some((t) => t.id === tag.id || t.name === tag.name);
        if (isSelected) {
            setSelectedTags(prev => prev.filter((t) => t.name !== tag.name));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    }

    function handleCreateNewTag() {
        const name = searchQuery.trim();
        if (!name) return;

        const newTag: Tag = { id: Date.now(), name, color: "#3B82F6" };
        setCustomTags(prev => [...prev, newTag]);
        setSelectedTags(prev => [...prev, newTag]);
        setSearchQuery("");
    }

    async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        const form = event.currentTarget;
        const fd = new FormData(form);

        const title = (fd.get("title") as string)?.trim();
        const description = (fd.get("description") as string)?.trim();

        if (!title) {
            setError("Tytuł zadania jest wymagany.");
            setIsLoading(false);
            return;
        }

        if (!dueDate) {
            setError("Termin (deadline) zadania jest wymagany.");
            setIsLoading(false);
            return;
        }

        const payload = {
            title,
            description: description || "",
            tags: selectedTags,
            deadline: dueDate.toISOString()
        };

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data && data.error ? String(data.error) : "Wystąpił błąd podczas zapisu zadania.";
                setError(msg);
                setIsLoading(false);
                return;
            }

            if (onTaskCreated) {
                onTaskCreated(data);
            }

            form.reset();
            setSelectedTags([]);
            setCustomTags([]);
            setDueDate(null);
            setError(null);
            setSearchQuery("");
            setIsTagsOpen(false);
            setIsExpanded(false);

        } catch {
            setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-100 p-3 w-full max-w-full">
            <button
                type="button"
                onClick={() => {
                    setIsExpanded(!isExpanded);
                    setError(null);
                }}
                className="flex w-full items-center gap-2 text-gray-500 font-medium select-none hover:text-gray-700 transition-colors"
            >
                <Plus className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-45 text-red-500" : ""}`}/>
                <span>{isExpanded ? "Anuluj tworzenie" : "Dodaj nowe zadanie"}</span>
            </button>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.form
                        onSubmit={handleCreateTask}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-visible space-y-4"
                    >
                        <div className="flex items-start gap-4 text-sm text-gray-700">
                            <span className="w-24 font-medium pt-2 text-gray-500 shrink-0">Tytuł *</span>
                            <div className="flex-1">
                                <input
                                    name="title"
                                    placeholder="Tytuł zadania"
                                    onChange={() => {
                                        if (isTitleError) setError(null);
                                    }}
                                    className={`w-full rounded-md px-3 py-2 text-sm outline-none transition-colors border ${
                                        isTitleError ? 'border-red-500 bg-white' : 'border-gray-200 bg-white focus:border-sky-500'
                                    }`}
                                />
                                {isTitleError && (
                                    <p className="text-xs text-red-600 mt-1">{error}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-sm text-gray-700">
                            <span className="w-24 font-medium pt-2 text-gray-500 shrink-0">Opis</span>
                            <textarea
                                name="description"
                                placeholder="Dodaj opis zadania..."
                                className="min-h-18 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 transition-colors"
                            />
                        </div>

                        <div className="flex items-start gap-4 text-sm text-gray-700">
                            <span className="w-24 font-medium pt-1 text-gray-500 shrink-0">Tagi</span>

                            <div className="relative flex-1" ref={tagsContainerRef}>
                                <div className="flex flex-wrap items-center gap-1.5 min-h-8">
                                    {selectedTags.map((tag) => (
                                        <span
                                            key={tag.id || tag.name}
                                            className="px-2 py-0.5 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleToggleTag(tag)}
                                            title="Kliknij, aby usunąć"
                                            style={{
                                                backgroundColor: `${tag.color}15`,
                                                borderColor: `${tag.color}40`,
                                                color: tag.color
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setIsTagsOpen(!isTagsOpen)}
                                        className="text-sky-500 text-sm font-medium hover:text-sky-600 flex items-center gap-1"
                                    >
                                        <Plus className="h-3.5 w-3.5"/> Dodaj tagi
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {isTagsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl z-50 space-y-3"
                                        >
                                            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45"/>

                                            <input
                                                type="text"
                                                placeholder="Wpisz nazwę tagu"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-sky-500"
                                            />

                                            <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                                                {filteredTags.map((tag) => {
                                                    const isChecked = selectedTags.some((t) => t.name === tag.name);
                                                    return (
                                                        <label
                                                            key={tag.id || tag.name}
                                                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleTag(tag)}
                                                                    className="sr-only"
                                                                />
                                                                <div
                                                                    className={`h-4 w-4 shrink-0 text-white rounded border flex items-center justify-center transition-colors ${
                                                                        isChecked ? "bg-sky-500 border-sky-500" : "bg-white border-gray-300"
                                                                    }`}
                                                                >
                                                                    {isChecked && <Check className="h-3 w-3 stroke-3"/>}
                                                                </div>
                                                                <span
                                                                    className="px-2 py-0.5 rounded text-xs font-bold"
                                                                    style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                                                                >
                                                                    {tag.name}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {searchQuery.trim() && !tagExists && (
                                                <button
                                                    type="button"
                                                    onClick={handleCreateNewTag}
                                                    className="w-full text-left text-xs font-semibold text-white bg-gray-500 hover:bg-gray-600 p-2 rounded-md transition-colors flex items-center gap-1"
                                                >
                                                    <Plus className="h-3.5 w-3.5"/> Dodaj tag &#34;{searchQuery.trim()}&#34;
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-700">
                            <span className="w-24 font-medium text-gray-500 shrink-0">Termin *</span>
                            <div className="flex-1 max-w-xs">
                                <DateTimePickerField
                                    value={dueDate}
                                    onChangeAction={(d: Date | null) => {
                                        setDueDate(d);
                                        if (isDeadlineError) setError(null);
                                    }}
                                    placeholder="Wybierz termin"
                                    inputClassName={isDeadlineError ? "border-red-500 bg-white focus:border-red-500" : "border-gray-200 focus:border-sky-500"}
                                />
                                {isDeadlineError && (
                                    <p className="text-xs text-red-600 mt-1">{error}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-md bg-sky-500 text-white px-4 py-1.5 text-sm font-medium hover:bg-sky-600 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Zapisywanie..." : "Zapisz zadanie"}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}