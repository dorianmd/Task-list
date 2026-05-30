"use client";

import { Task } from "../types/index";
import { TaskRow } from "./TaskRow";
import { TaskCreator } from "./TaskCreator";
import { useMemo } from "react";

type DayFilter = "all" | "today" | "tomorrow" | "week" | "overdue";
type SortOption = "created-desc" | "created-asc" | "deadline-asc" | "deadline-desc" | "title-asc" | "title-desc";

interface TaskCardProps {
    title: string;
    tasks: Task[];
    allTasks: Task[];
    onTaskCreated: (task: Task) => void;
    onToggleComplete: (id: number, completed: boolean) => void;
    onTaskSelect: (task: Task) => void;
    selectedTaskId: number | null;
    onDayFilterChange: (value: DayFilter) => void;
    sortOption: SortOption;
    onSortOptionChange: (value: SortOption) => void;
    dayFilter?: DayFilter;
}


export function TaskCard({
                             title,
                             tasks,
                             allTasks,
                             onTaskCreated,
                             onToggleComplete,
                             onTaskSelect,
                             selectedTaskId,
                             sortOption,
                             onSortOptionChange,
                         }: TaskCardProps) {
    const uniqueTags = useMemo(() => {
        return Array.from(
            new Map(allTasks.flatMap((t) => t.tags || []).map((tag) => [tag.id, tag])).values()
        );
    }, [allTasks]);

    return (
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">Sortuj według:</span>
                    <select
                        value={sortOption}
                        onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 outline-none"
                    >
                        <option value="created-desc">Najnowsze</option>
                        <option value="created-asc">Najstarsze</option>
                        <option value="deadline-asc">Termin rosnąco</option>
                        <option value="deadline-desc">Termin malejąco</option>
                        <option value="title-asc">Tytuł A-Z</option>
                        <option value="title-desc">Tytuł Z-A</option>
                    </select>
                </div>
            </div>

            <TaskCreator
                onTaskCreated={onTaskCreated}
                availableTags={uniqueTags}
            />

            <div className="mt-4 space-y-1">
                {tasks.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2 pl-2">Brak zadań</p>
                ) : (
                    tasks.map((task) => {
                        const subtasks = allTasks.filter(
                            (sub) => sub.parentId === task.id || (sub as Task & { parent_id?: number }).parent_id === task.id
                        );

                        return (
                            <div key={task.id} className="space-y-0.5">
                                {/* Zadanie główne */}
                                <TaskRow
                                    task={task}
                                    onToggleComplete={onToggleComplete}
                                    onTaskSelect={onTaskSelect}
                                    isSelected={selectedTaskId === task.id}
                                />

                                {/* Lista wciętych subtasków */}
                                {subtasks.length > 0 && (
                                    <div className="space-y-0.5">
                                        {subtasks.map((subtask) => (
                                            <TaskRow
                                                key={subtask.id}
                                                task={subtask}
                                                onToggleComplete={onToggleComplete}
                                                onTaskSelect={onTaskSelect}
                                                isSelected={selectedTaskId === subtask.id}
                                                isSubtask={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}