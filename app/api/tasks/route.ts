import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/prismaClient";

function getUserId(request: NextRequest) {
    return request.headers.get("x-user-id");
}

export async function GET(req: NextRequest) {
    const userId = getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: "Authorization error" }, { status: 401 });
    }

    try {
        const tasks = await prismaClient.task.findMany({
            where: { userId },
            include: { tags: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const userId = getUserId(req);
    if (!userId) {
        return NextResponse.json({ error: "Authorization error" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, tags = [], deadline, parentId, parent_id } = body as {
            title?: string;
            description?: string;
            tags?: Array<{ name: string; color?: string }>;
            deadline?: string | null;
            parentId?: number | null;
            parent_id?: number | null;
        };

        if (!title || String(title).trim() === "") {
            return NextResponse.json({ error: "Tytuł zadania jest wymagany" }, { status: 400 });
        }

        if (!deadline) {
            return NextResponse.json({ error: "Deadline zadania jest wymagany" }, { status: 400 });
        }

        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
            return NextResponse.json({ error: "Nieprawidłowy format daty deadline" }, { status: 400 });
        }

        const tagsRelation = Array.isArray(tags)
            ? tags
                .filter((t) => t && typeof t.name === "string" && t.name.trim() !== "")
                .map((tag) => {
                    const normalizedName = tag.name.trim();
                    return {
                        where: { userId_name: { userId, name: normalizedName } },
                        create: {
                            name: normalizedName,
                            color: tag.color || "#3B82F6",
                            userId,
                        },
                    };
                })
            : [];

        const resolvedParentId = parentId ?? parent_id ?? null;

        const newTask = await prismaClient.task.create({
            data: {
                title: title.trim(),
                description: description || "",
                userId,
                deadline: deadlineDate,
                parentId: resolvedParentId,
                ...(tagsRelation.length > 0 ? { tags: { connectOrCreate: tagsRelation } } : {}),
            },
            include: { tags: true },
        });

        return NextResponse.json(newTask, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}