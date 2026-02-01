import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) return null; // Middleware handles redirect, but type safety

    // Fetch projects based on role/access
    let projects;
    if (session.role === 'ADMIN') {
        projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { tasks: true },
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
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Projects</h1>
                    <p className="text-slate-500 mt-1">Select a project to view its board</p>
                </div>
                {/* Add Project Button could go here */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block group"
                    >
                        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" /></svg>
                                </div>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">
                                    {project._count.tasks} Tasks
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {project.name}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
                                {project.description || 'No description provided.'}
                            </p>
                            <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span>Last updated just now</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <p className="text-slate-500">No projects found for your account.</p>
                </div>
            )}
        </div>
    );
}
