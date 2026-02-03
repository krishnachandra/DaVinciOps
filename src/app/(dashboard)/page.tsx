import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CreateProjectButton } from '@/components/CreateProjectButton';
import { ProjectList } from '@/components/ProjectList';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) return null; // Middleware handles redirect, but type safety

    // Fetch projects based on role/access
    let projects;
    if (session.role === 'ADMIN') {
        projects = await prisma.project.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                createdAt: true,
                _count: {
                    select: { tasks: true },
                },
                users: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    } else {
        projects = await prisma.project.findMany({
            where: {
                users: {
                    some: {
                        id: session.id as string,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                createdAt: true,
                _count: {
                    select: { tasks: true },
                },
                users: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    const allUsers = await prisma.user.findMany({
        orderBy: { username: 'asc' },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Projects</h1>
                    <p className="text-slate-500 mt-1">Select a project to view its board</p>
                </div>
                <CreateProjectButton currentUser={session.username as string} users={allUsers} />
            </div>

            <ProjectList
                projects={projects.map(p => ({
                    ...p,
                    imageUrl: p.imageUrl,
                    _count: p._count,
                    users: p.users.map(u => ({
                        id: u.id,
                        username: u.username,
                        role: u.role
                    }))
                }))}
                session={{
                    id: session.id as string,
                    role: session.role as string,
                    username: session.username as string
                }}
                allUsers={allUsers}
            />


        </div>
    );
}
