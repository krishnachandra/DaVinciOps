'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateTaskStatus(taskId: string, newStatus: string, projectId: string) {
    await prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus },
    });
    revalidatePath(`/projects/${projectId}`);
}

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string;
    const projectId = formData.get('projectId') as string;
    const description = formData.get('description') as string;

    if (!title || !projectId) return;

    await prisma.task.create({
        data: {
            title,
            description,
            status: 'TO_START',
            projectId,
        },
    });
    revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string) {
    await prisma.task.delete({
        where: { id: taskId },
    });
    revalidatePath(`/projects/${projectId}`);
}
