"use client";

import { CalendarDays, Check, ChevronRight, Tags } from "lucide-react";
import { Task } from "../types/index";

interface TaskRowProps {
    task: Task;
    onToggleComplete: (id: number, completed: boolean) => void;
    onTaskSelect: (task: Task) => void;
    isSelected: boolean;
    isSubtask?: boolean;
}

export function TaskRow({ task, onToggleComplete, onTaskSelect, isSelected, isSubtask = false }: TaskRowProps) {
    const description = task.description?.trim();

    return (
        <button
            type="button"
            onClick={() => onTaskSelect(task)}
            className={`group w-full border-b border-gray-200 py-3 text-left last:border-b-0 rounded-lg transition-colors hover:bg-gray-100/50 ${
                isSelected ? "bg-sky-50/70 hover:bg-sky-50/90" : ""
            } ${isSubtask ? "pl-9 border-none py-2" : "pl-2"}`}
        >
            <div className="flex items-center justify-between gap-3 text-gray-700">
                <div className="min-w-0 flex-1 flex items-center gap-3">
                    <div
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleComplete(task.id, task.completed);
                        }}
                        className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                            task.completed ? "bg-sky-500 border-sky-500 text-white" : "bg-white border-gray-300 hover:border-sky-400"
                        }`}
                    >
                        {task.completed && <Check className="h-3 w-3 stroke-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className={`block truncate font-medium ${
                            task.completed ? "line-through text-gray-400" : "text-gray-800"
                        } ${isSubtask ? "text-[13px]" : ""}`}>
                            {task.title}
                        </span>

                        {/* Ukrywamy opis, tagi i datę, jeśli to jest subtask */}
                        {!isSubtask && (
                            <>
                                {description && (
                                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">
                                        {description}
                                    </p>
                                )}

                                {(task.tags?.length > 0 || task.deadline) && (
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        {task.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold"
                                                style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                                            >
                                                <Tags className="h-3 w-3" />
                                                {tag.name}
                                            </span>
                                        ))}

                                        {task.deadline && (
                                            <p className="flex items-center gap-1 text-xs text-gray-400">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                <span>
                                                    {new Date(task.deadline).toLocaleDateString("pl-PL", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 cursor-pointer text-gray-400 transition-transform group-hover:translate-x-0.5" />
            </div>
        </button>
    );
}