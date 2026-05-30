export interface Tag {
    id: number;
    name: string;
    color: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    isImportant?: boolean;
    createdAt: string;
    deadline: string | null;
    parentId?: number | null;
    tags: Tag[];
}