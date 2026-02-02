'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function updateTaskStatus(taskId: string, newStatus: string, projectId: string) {
    const data: any = { status: newStatus };

    if (newStatus === 'COMPLETED') {
        data.completedAt = new Date();
    } else {
        data.completedAt = null;
    }

    await prisma.task.update({
        where: { id: taskId },
        data: data,
    });
    revalidatePath(`/projects/${projectId}`);
}

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string;
    const projectId = formData.get('projectId') as string;
    const description = formData.get('description') as string;
    const dueDateStr = formData.get('dueDate') as string;
    const priorityStr = formData.get('priority') as string;

    if (!title || !projectId) return;

    await prisma.task.create({
        data: {
            title,
            description,
            status: 'TO_START',
            projectId,
            dueDate: dueDateStr ? new Date(dueDateStr) : null,
            priority: priorityStr ? parseInt(priorityStr) : 1,
        },
    });
    revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string) {
    const session = await getSession();
    if (!session) return;

    if (session.username === 'nkc') {
        // Hard Delete for Super Admin
        await prisma.task.delete({
            where: { id: taskId },
        });
    } else {
        // Soft Delete for Co-Admins
        await prisma.task.update({
            where: { id: taskId },
            data: { isSoftDeleted: true }
        });
    }
    revalidatePath(`/projects/${projectId}`);
}

export async function updateTask(formData: FormData) {
    const taskId = formData.get('taskId') as string;
    const projectId = formData.get('projectId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDateStr = formData.get('dueDate') as string;
    const priorityStr = formData.get('priority') as string;

    if (!taskId || !projectId || !title) return;

    await prisma.task.update({
        where: { id: taskId },
        data: {
            title,
            description,
            dueDate: dueDateStr ? new Date(dueDateStr) : null,
            priority: priorityStr ? parseInt(priorityStr) : 1,
        },
    });
    revalidatePath(`/projects/${projectId}`);
}

export async function createProject(formData: FormData) {
    const session = await getSession();
    // Only 'nkc' can create projects
    if (!session || !session.id || session.username !== 'nkc') return;

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    const userIdsStr = formData.get('userIds') as string;
    let userIds: string[] = [];
    if (userIdsStr) {
        try {
            userIds = JSON.parse(userIdsStr);
        } catch (e) {
            console.error("Failed to parse userIds", e);
        }
    }

    if (!name || !description) return;

    // Connect creator AND selected users
    const usersToConnect = [
        { id: session.id as string },
        ...userIds.map(id => ({ id }))
    ];

    await prisma.project.create({
        data: {
            name,
            description,
            imageUrl: imageUrl || null,
            users: {
                connect: usersToConnect
            }
        }
    });

    revalidatePath('/');
}

export async function updateProject(formData: FormData) {
    const session = await getSession();
    // Only 'nkc' can update projects
    if (!session || !session.id || session.username !== 'nkc') return;

    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const userIdsStr = formData.get('userIds') as string;

    if (!projectId || !name || !description) return;

    let userIds: string[] = [];
    if (userIdsStr) {
        try {
            userIds = JSON.parse(userIdsStr);
        } catch (e) {
            console.error("Failed to parse userIds", e);
        }
    }

    // Connect creator AND selected users
    // If the creator is not passed in userIds (which it won't be from the form), we must ensure they stay connected.
    // Ideally, we should just set the users list to the new selection + current admin.

    // NOTE: This assumes 'nkc' (session.id) should always be part of the project.
    // If we wanted to allow 'nkc' to remove themselves, we'd need different logic.
    const usersToConnect = [
        { id: session.id as string },
        ...userIds.map(id => ({ id }))
    ];

    await prisma.project.update({
        where: { id: projectId },
        data: {
            name,
            description,
            imageUrl: imageUrl || null,
            users: {
                set: usersToConnect
            }
        }
    });

    revalidatePath('/');
}

export async function createUser(formData: FormData) {
    const session = await getSession();
    // Only admin can create users
    if (!session || session.username !== 'nkc') return;

    const username = formData.get('username') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!username || !email || !password) return;

    // const bcrypt = require('bcryptjs');
    // const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            username,
            name: name || null,
            email,
            password, // Store plain text as requested
            role: 'USER'
        }
    });

    revalidatePath('/');
}

export async function deleteUser(userId: string) {
    const session = await getSession();
    // Only admin can delete users
    if (!session || session.username !== 'nkc') return;

    // Don't allow deleting the admin user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.username === 'nkc') return;

    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath('/');
}

export async function updateUser(formData: FormData) {
    const session = await getSession();
    // Only admin can update users
    if (!session || session.username !== 'nkc') return;

    const userId = formData.get('userId') as string;
    const username = formData.get('username') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!userId || !username || !email) return;

    const data: any = {
        username,
        name: name || null,
        email,
    };

    if (password) {
        // const bcrypt = require('bcryptjs');
        // data.password = await bcrypt.hash(password, 10);
        data.password = password; // Store plain text
    }

    await prisma.user.update({
        where: { id: userId },
        data
    });

    revalidatePath('/');
}
