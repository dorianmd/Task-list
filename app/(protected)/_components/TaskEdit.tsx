"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Plus, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DateTimePickerField from "./DateTimePickerField";
import { Tag, Task } from "../types/index";

interface TaskEditProps {
    task: Task | null;
    allTasks: Task[];
    availableTags: Tag[];
    onTaskUpdated: (task: Task) => void;
    onTaskDeleted: (id: number) => void;
    onTaskCreated: (task: Task) => void;
    onClose?: () => void;
}

function dedupeTags(tags: Tag[]) {
    return Array.from(new Map(tags.map((tag) => [tag.id, tag])).values());
}

export function TaskEdit({
                             task,
                             allTasks,
                             availableTags,
                             onTaskUpdated,
                             onTaskDeleted,
                             onTaskCreated,
                             onClose,
                         }: TaskEditProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [deadlineError, setDeadlineError] = useState<string | null>(null);
    const [title, setTitle] = useState(task?.title ?? "");
    const [description, setDescription] = useState(task?.description ?? "");
    const [completed, setCompleted] = useState(task?.completed ?? false);
    const [isImportant, setIsImportant] = useState(!!task?.isImportant);
    const [dueDate, setDueDate] = useState<Date | null>(task?.deadline ? new Date(task.deadline) : null);
    const [selectedTags, setSelectedTags] = useState<Tag[]>(task?.tags ?? []);
    const [customTags, setCustomTags] = useState<Tag[]>([]);
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [subtaskTitle, setSubtaskTitle] = useState("");
    const [subtaskError, setSubtaskError] = useState<string | null>(null);
    const [isSubtaskLoading, setIsSubtaskLoading] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);

    const tagsContainerRef = useRef<HTMLDivElement>(null);

    // Sprawdzamy, czy aktualnie edytowane zadanie jest subtaskiem
    const isCurrentTaskSubtask = !!(task?.parentId || (task as Task & { parent_id?: number })?.parent_id);

    // Resetujemy i nadpisujemy lokalny stan komponentu przy otwarciu edycji dla innego zadania. 
    // Używamy setTimeout(..., 0), aby upewnić się, że React zrenderował najpierw poprawnie element.
    useEffect(() => {
        if (!task) return;

        const syncTimer = window.setTimeout(() => {
            setTitle(task.title);
            setDescription(task.description ?? "");
            setCompleted(task.completed);
            setIsImportant(!!task.isImportant);
            setDueDate(task.deadline ? new Date(task.deadline) : null);
            setSelectedTags(task.tags ?? []);
            setCustomTags([]);
            setError(null);
            setTitleError(null);
            setDeadlineError(null);
            setSubtaskTitle("");
            setSubtaskError(null);
            setIsSubtaskLoading(false);
            setIsTagsOpen(false);
            setSearchQuery("");
        }, 0);

        return () => window.clearTimeout(syncTimer);
    }, [task]);

    // Zamyka dropdowna tagów przy kliknięciu poza niego
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (isTagsOpen && tagsContainerRef.current && !tagsContainerRef.current.contains(event.target as Node)) {
                setIsTagsOpen(false);
                setSearchQuery("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isTagsOpen]);

    useEffect(() => {
        if (isTagsOpen && tagsContainerRef.current) {
            const rect = tagsContainerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top > windowHeight / 2) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [isTagsOpen]);

    const allTagOptions = useMemo(() => dedupeTags([...availableTags, ...customTags]), [availableTags, customTags]);
    const filteredTags = allTagOptions.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const tagExists = allTagOptions.some((tag) => tag.name.toLowerCase() === searchQuery.trim().toLowerCase());
    const subtasks = task ? allTasks.filter((candidate) => candidate.parentId === task.id || (candidate as Task & { parent_id?: number }).parent_id === task.id) : [];

    function handleToggleTag(tag: Tag) {
        const isSelected = selectedTags.some((t) => t.id === tag.id);
        if (isSelected) {
            setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
            return;
        }
        setSelectedTags((prev) => [...prev, tag]);
    }

    function handleCreateNewTag() {
        const name = searchQuery.trim();
        if (!name) return;

        const newTag: Tag = {
            id: Date.now(),
            name,
            color: "#3B82F6",
        };

        setCustomTags((prev) => [...prev, newTag]);
        setSelectedTags((prev) => [...prev, newTag]);
        setSearchQuery("");
    }

    async function handleSave() {
        if (!task || isLoading) return;

        setError(null);
        setTitleError(null);
        setDeadlineError(null);

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setTitleError("Tytuł zadania jest wymagany.");
            return;
        }

        // Dla subtasków ignorujemy walidację terminu, bo dziedziczą go po rodzicu
        if (!dueDate && !isCurrentTaskSubtask) {
            setDeadlineError("Termin zadania jest wymagany.");
            return;
        }

        setIsLoading(true);
        try {
            const bodyData: Record<string, unknown> = {
                title: trimmedTitle,
                completed,
            };

            // Dodatkowe pola wysyłamy tylko, jeśli to NIE jest subtask
            if (!isCurrentTaskSubtask) {
                bodyData.description = description.trim();
                bodyData.isImportant = isImportant;
                bodyData.deadline = dueDate ? dueDate.toISOString() : null;
                bodyData.tags = selectedTags;
            }

            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                setError("Nie udało się zapisać zmian.");
                return;
            }

            const updatedTask = (await response.json()) as Task;
            onTaskUpdated(updatedTask);
            setError(null);
        } catch {
            setError("Nie udało się zapisać zmian.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (!task || isLoading) return;

        const confirmed = window.confirm("Na pewno usunąć to zadanie?");
        if (!confirmed) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
            if (!response.ok) {
                setError("Nie udało się usunąć zadania.");
                return;
            }

            onTaskDeleted(task.id);
            onClose?.();
        } catch {
            setError("Nie udało się usunąć zadania.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleInlineDelete(id: number) {
        const confirmed = window.confirm("Na pewno usunąć ten subtask?");
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
            if (!response.ok) return;
            onTaskDeleted(id);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleCreateSubtask() {
        if (!task || isSubtaskLoading) return;

        const trimmedTitle = subtaskTitle.trim();
        if (!trimmedTitle) {
            setSubtaskError("Tytuł subtaska jest wymagany.");
            return;
        }

        const parentDeadline = task.deadline;
        if (!parentDeadline) {
            setSubtaskError("Zadanie główne nie ma ustawionego terminu.");
            return;
        }

        setIsSubtaskLoading(true);
        setSubtaskError(null);

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: trimmedTitle,
                    description: "",
                    tags: [],
                    deadline: parentDeadline,
                    parentId: task.id,
                    parent_id: task.id,
                }),
            });

            if (!response.ok) {
                setSubtaskError("Nie udało się dodać subtaska.");
                return;
            }

            const createdSubtask = (await response.json()) as Task;
            onTaskCreated(createdSubtask);
            setSubtaskTitle("");
        } catch {
            setSubtaskError("Nie udało się dodać subtaska.");
        } finally {
            setIsSubtaskLoading(false);
        }
    }

    if (!task) return null;

    return (
        <motion.aside
            initial={{ opacity: 0, x: 50, width: 0, maxWidth: 440, paddingLeft: 0, paddingRight: 0 }}
            animate={{ opacity: 1, x: 0, width: "100%", maxWidth: 440, paddingLeft: 16, paddingRight: 16 }}
            exit={{ opacity: 0, x: 50, width: 0, maxWidth: 440, paddingLeft: 0, paddingRight: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="flex h-full shrink-0 flex-col overflow-hidden lg:rounded-2xl lg:border lg:border-gray-200 bg-[#ededed] py-4 w-full"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Panel</p>
                    <h2 className="truncate text-2xl font-bold text-gray-800">
                        {isCurrentTaskSubtask ? "Edycja subtaska" : "Edycja zadania"}
                    </h2>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-[#f6f6f6] p-4">
                        <div className="flex items-start gap-4 text-sm text-gray-700">
                            <span className="w-24 shrink-0 pt-2 font-medium text-gray-500">Tytuł *</span>
                            <div className="flex-1">
                                <input
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        if (titleError) setTitleError(null);
                                    }}
                                    className={`w-full rounded-md px-3 py-2 text-sm outline-none ${titleError ? "border border-red-500 bg-white" : "border border-gray-200 bg-white"}`}
                                    placeholder="Tytuł zadania"
                                />
                                {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}
                            </div>
                        </div>

                        {/* Opcje ukrywane dla subtasków */}
                        {!isCurrentTaskSubtask && (
                            <>
                                <div className="mt-4 flex items-start gap-4 text-sm text-gray-700">
                                    <span className="w-24 shrink-0 pt-2 font-medium text-gray-500">Opis</span>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="min-h-24 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                                        placeholder="Opis zadania"
                                    />
                                </div>

                                <div className="mt-4 flex items-start gap-4 text-sm text-gray-700">
                                    <span className="w-24 shrink-0 pt-2 font-medium text-gray-500">Termin *</span>
                                    <div className="flex-1">
                                        <DateTimePickerField
                                            value={dueDate}
                                            onChangeAction={(d: Date | null) => {
                                                setDueDate(d);
                                                if (deadlineError) setDeadlineError(null);
                                            }}
                                            placeholder="Wybierz termin"
                                            inputClassName={deadlineError ? "border-red-500" : "border-gray-200"}
                                        />
                                        {deadlineError && <p className="mt-1 text-xs text-red-600">{deadlineError}</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className={`mt-4 grid gap-3 ${isCurrentTaskSubtask ? "grid-cols-1" : "grid-cols-2"}`}>
                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={completed}
                                    onChange={(e) => setCompleted(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-sky-500 cursor-pointer"
                                />
                                <span>Zakończone</span>
                            </label>

                            {!isCurrentTaskSubtask && (
                                <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isImportant}
                                        onChange={(e) => setIsImportant(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-sky-500 cursor-pointer"
                                    />
                                    <span>Ważne</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Sekcje ukrywane w całości dla subtasków */}
                    {!isCurrentTaskSubtask && (
                        <>
                            {/* Sekcja subtasków */}
                            <div className="rounded-xl border border-gray-200 bg-[#f6f6f6] p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Subtaski</p>
                                    <span className="text-xs text-gray-400">{subtasks.length}</span>
                                </div>

                                <div className="space-y-2">
                                    {subtasks.length === 0 ? (
                                        <p className="text-sm text-gray-400">Brak subtasków</p>
                                    ) : (
                                        subtasks.map((subtask) => (
                                            <div key={subtask.id} className="group rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={subtask.completed ? "line-through text-gray-400" : ""}>{subtask.title}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold group-hover:hidden ${subtask.completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                            {subtask.completed ? "Zrobione" : "Aktywne"}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleInlineDelete(subtask.id)}
                                                            className="hidden group-hover:flex p-0.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-4 space-y-2 rounded-lg border border-dashed border-gray-300 bg-white p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dodaj subtask</p>
                                    <input
                                        value={subtaskTitle}
                                        onChange={(e) => {
                                            setSubtaskTitle(e.target.value);
                                            if (subtaskError) setSubtaskError(null);
                                        }}
                                        placeholder="Tytuł subtaska"
                                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                                    />
                                    {subtaskError && <p className="text-xs text-red-600">{subtaskError}</p>}
                                    <button
                                        type="button"
                                        onClick={handleCreateSubtask}
                                        disabled={isSubtaskLoading}
                                        className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                                    >
                                        <Plus className="h-4 w-4" /> {isSubtaskLoading ? "Dodawanie..." : "Dodaj subtask"}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-[#f6f6f6] p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Tagi (kliknij, aby usunąć)</p>
                                <div className="relative" ref={tagsContainerRef}>
                                    <div className="flex flex-wrap items-center gap-1.5 min-h-8">
                                        {selectedTags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                onClick={() => handleToggleTag(tag)}
                                                title="Kliknij, aby usunąć tag"
                                                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold cursor-pointer select-none hover:opacity-80 transition-opacity"
                                                style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}40`, color: tag.color }}
                                            >
                                                <TagsIconFallback />
                                                {tag.name}
                                            </span>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setIsTagsOpen((prev) => !prev)}
                                            className="flex items-center gap-1 text-sm font-medium text-sky-500 hover:text-sky-600"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Dodaj tagi
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {isTagsOpen && (
                                            <motion.div
                                                initial={openUpward ? { opacity: 0, y: 10, scale: 0.95 } : { opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={openUpward ? { opacity: 0, y: 10, scale: 0.95 } : { opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                style={openUpward ? { bottom: "100%", marginBottom: "8px" } : { top: "full", marginTop: "8px" }}
                                                className="absolute left-0 z-50 w-72 space-y-3 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
                                            >
                                                <div className={`absolute h-3 w-3 rotate-45 border-gray-200 bg-white ${
                                                    openUpward
                                                        ? "-bottom-1.5 left-6 border-r border-b"
                                                        : "-top-1.5 left-6 border-l border-t"
                                                }`} />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Wpisz nazwę tagu"
                                                    className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-sky-500"
                                                />

                                                <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
                                                    {filteredTags.map((tag) => {
                                                        const isChecked = selectedTags.some((t) => t.id === tag.id);
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={tag.id}
                                                                onClick={() => handleToggleTag(tag)}
                                                                className="flex w-full items-center justify-between rounded-lg p-1.5 text-left text-sm hover:bg-gray-50"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span
                                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${isChecked ? "border-sky-500 bg-sky-500 text-white" : "border-gray-300 bg-white"}`}
                                                                    >
                                                                        {isChecked && <Check className="h-3 w-3 stroke-3" />}
                                                                    </span>
                                                                    <span
                                                                        className="rounded px-2 py-0.5 text-xs font-bold"
                                                                        style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                                                                    >
                                                                        {tag.name}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {searchQuery.trim() && !tagExists && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateNewTag}
                                                        className="flex w-full items-center gap-1 rounded-md bg-gray-500 p-2 text-left text-xs font-semibold text-white transition-colors hover:bg-gray-600"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" /> Dodaj tag &#34;{searchQuery.trim()}&#34;
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-200 pt-3">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    <Trash2 className="h-4 w-4" /> Usuń
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    <Save className="h-4 w-4" /> {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
                </button>
            </div>
        </motion.aside>
    );
}

function TagsIconFallback() {
    return <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-current text-[8px] leading-none">#</span>;
}