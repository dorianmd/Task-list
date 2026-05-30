import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prismaClient";

function getUserId(request: NextRequest) {
    return request.headers.get("x-user-id");
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
    const userId = getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: "Authorization error" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const taskId = parseInt(id);
        if (isNaN(taskId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const { title, description, completed, isImportant, tags, deadline } = await req.json();

        const task = await prismaClient.task.findUnique({
            where: { id: taskId },
        });

        if (!task || task.userId !== userId) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description;
        if (completed !== undefined) updateData.completed = completed;
        if (isImportant !== undefined) updateData.isImportant = isImportant;
        if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

        if (tags !== undefined) {
            // Relacja tagów: Odpinamy wszystkie wcześniejsze tagi (set: []) 
            // po to, aby przypiąć nowe bez obaw o duplikaty. Opcja connectOrCreate automatycznie utworzy brakujące w bazie.
            const tagsRelation = (tags || []).map((tag: { name: string; color: string }) => {
                const normalizedName = tag.name.trim();
                return {
                    where: {
                        userId_name: {
                            userId: userId,
                            name: normalizedName,
                        },
                    },
                    create: {
                        name: normalizedName,
                        color: tag.color || "#3B82F6",
                        userId: userId,
                    },
                };
            });

            updateData.tags = {
                set: [],
                connectOrCreate: tagsRelation,
            };
        }

        const updatedTask = await prismaClient.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                tags: true,
            },
        });

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
    const userId = getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: "Authorization error" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const taskId = parseInt(id);
        if (isNaN(taskId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const task = await prismaClient.task.findUnique({
            where: { id: taskId },
        });

        if (!task || task.userId !== userId) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // Usuwanie zadania (subtaski są usuwane kaskadowo - zdefiniowane w schema.prisma za pomocą onDelete: Cascade)
        await prismaClient.task.delete({
            where: { id: taskId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}