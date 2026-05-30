"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "../_components/Sidebar";
import { TaskCard } from "../_components/TaskCard";
import { TaskEdit } from "../_components/TaskEdit";
import { Task } from "../types/index";
import { AnimatePresence } from "framer-motion";

type SortOption = "created-desc" | "created-asc" | "deadline-asc" | "deadline-desc" | "title-asc" | "title-desc";
type ViewFilter = "all" | "important" | "today" | "upcoming" | "overdue" | "completed";

function sortTasks(tasks: Task[], sortOption: SortOption) {
  return [...tasks].sort((a, b) => {
    switch (sortOption) {
      case "created-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "created-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "deadline-asc": {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      case "deadline-desc": {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      case "title-asc":
        return a.title.localeCompare(b.title, "pl", { sensitivity: "base" });
      case "title-desc":
        return b.title.localeCompare(a.title, "pl", { sensitivity: "base" });
      default:
        return 0;
    }
  });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [activeTagIds, setActiveTagIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("created-desc");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const handleSubtaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };


  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const handleTaskDeleted = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setSelectedTaskId((prev) => (prev === id ? null : prev));
  };

  const handleTagToggle = (tagId: number) => {
    setActiveTagIds((prev) =>
        prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleClearTags = () => setActiveTagIds([]);

  const handleToggleComplete = async (id: number, currentStatus: boolean) => {
    const previousTasks = [...tasks];

    setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t))
    );

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) {
        console.error("Failed to update task status");
        setTasks(previousTasks);
        return;
      }

      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      console.error(err);
      setTasks(previousTasks);
    }
  };

  const allTags = useMemo(() => {
    return Array.from(
        new Map(tasks.flatMap((t) => t.tags).map((tag) => [tag.id, tag])).values()
    );
  }, [tasks]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  // Wyszukujemy zadania spełniające wszystkie 3 kryteria naraz: tekst, tagi oraz aktywny widok z menu.
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

    const matched = tasks.filter((task) => {
      const description = task.description ?? "";
      const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
          activeTagIds.length === 0 || task.tags.some((tag) => activeTagIds.includes(tag.id));

      let matchesView = true;
      switch (viewFilter) {
        case "important":
          matchesView = task.isImportant === true;
          break;
        case "completed":
          matchesView = task.completed;
          break;
        case "today": {
          if (!task.deadline) {
            matchesView = false;
          } else {
            const taskTime = new Date(task.deadline).getTime();
            matchesView = taskTime >= startOfToday && taskTime <= endOfToday;
          }
          break;
        }
        case "upcoming":
          matchesView = !!task.deadline && new Date(task.deadline).getTime() > now.getTime() && !task.completed;
          break;
        case "overdue":
          matchesView = !!task.deadline && new Date(task.deadline).getTime() < now.getTime() && !task.completed;
          break;
        default:
          matchesView = true;
          break;
      }


      return matchesSearch && matchesTags && matchesView;
    });

    return sortTasks(matched, sortOption);
  }, [tasks, searchQuery, activeTagIds, viewFilter, sortOption]);

  // Odfiltrowujemy subtaski z głównej listy, aby wyświetlały się tylko jako dzieci we właściwym TaskEdit.
  const mainTasksOnly = useMemo(() => {
    return filteredTasks.filter(
        (task) => !task.parentId && !(task as Task & { parent_id?: number }).parent_id
    );
  }, [filteredTasks]);

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#f8f8f8] lg:bg-[#dbe5d7] text-gray-600 font-medium">Ładowanie aplikacji...</div>;
  }

  return (
      <div className="h-screen overflow-hidden bg-[#f8f8f8] lg:bg-[#dbe5d7] p-0 lg:p-5">
        <main className="mx-auto flex h-full w-full max-w-screen gap-0 lg:gap-4 rounded-none lg:rounded-3xl bg-[#f4f5f4] p-0 lg:p-5 shadow-none lg:shadow-[0_20px_60px_rgba(0,0,0,0.14)] relative overflow-hidden lg:overflow-visible">

          <AnimatePresence>
            {(isSidebarOpenMobile || (typeof window !== "undefined" ? window.innerWidth >= 1024 : true)) && (
                <div className={`absolute inset-0 z-20 lg:static lg:z-auto h-full w-full lg:w-auto shrink-0 ${!isSidebarOpenMobile ? "hidden lg:block" : "block"}`}>
                    <Sidebar
                        tags={allTags}
                        activeTagIds={activeTagIds}
                        onTagToggle={handleTagToggle}
                        onClearTags={handleClearTags}
                        viewFilter={viewFilter}
                        onViewFilterChange={setViewFilter}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onCloseMobile={() => setIsSidebarOpenMobile(false)}
                    />
                </div>
            )}
          </AnimatePresence>

          <section className={`flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:rounded-2xl lg:border lg:border-gray-200 bg-[#f8f8f8] p-3 md:p-5 ${
              selectedTaskId ? "hidden lg:flex" : "flex"
          }`}>
            <header className="mb-4 flex items-center gap-3">
              <button 
                  onClick={() => setIsSidebarOpenMobile(true)} 
                  className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-200"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800">Zadania</h1>
              <span className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-lg md:text-xl text-gray-700">
                {filteredTasks.length}
              </span>
            </header>

            <div className="space-y-4">
              <TaskCard
                  title="Lista zadań"
                  tasks={mainTasksOnly}
                  allTasks={tasks}
                  onTaskCreated={handleTaskCreated}
                  onToggleComplete={handleToggleComplete}
                  onTaskSelect={(task) => setSelectedTaskId(task.id)}
                  selectedTaskId={selectedTaskId}
                  sortOption={sortOption}
                  onSortOptionChange={setSortOption}
                  onDayFilterChange={() => {}}
              />
            </div>
          </section>

          <AnimatePresence>
            {selectedTask && (
                <div className={`absolute inset-0 z-10 flex justify-end lg:static lg:block lg:w-auto h-full ${!selectedTaskId ? "hidden lg:block" : ""}`}>
                <TaskEdit
                    key={selectedTaskId ?? "none"}
                    task={selectedTask}
                    allTasks={tasks}
                    availableTags={allTags}
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                    onTaskCreated={handleSubtaskCreated}
                    onClose={() => setSelectedTaskId(null)}
                />
                </div>
            )}
          </AnimatePresence>

        </main>
      </div>
  );
}