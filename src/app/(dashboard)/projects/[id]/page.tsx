import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ProjectBoard } from '@/components/ProjectBoard';

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getSession();
    if (!session) return null;

    const whereClause = session.role === 'ADMIN'
        ? { id }
        : { id, users: { some: { id: session.id as string } } };

    const project = await prisma.project.findFirst({
        where: whereClause,
        include: {
            tasks: {
                orderBy: { createdAt: 'desc' }, // Newest first
            },
            users: true,
        },
    });

    if (!project) {
        notFound();
    }

    // Serialize dates for Client Component
    const serializableProject = {
        ...project,
        createdAt: project.createdAt.toISOString(),
        tasks: project.tasks.map(t => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            completedAt: t.completedAt ? t.completedAt.toISOString() : null,
            isSoftDeleted: t.isSoftDeleted,
        })),
    };

    return (
        <div className="h-[calc(100vh-8rem)]">
            <ProjectBoard project={serializableProject} tasks={serializableProject.tasks} currentUser={session.username as string} />
        </div>
    );
}
