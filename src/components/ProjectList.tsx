"use client";

import { useState } from 'react';
import Link from 'next/link';
import { EditProjectModal } from './EditProjectModal';

type Project = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
    _count: { tasks: number };
    users: { id: string; username: string; role: string }[];
};

type Session = {
    id: string;
    role: string;
    username: string;
};

export function ProjectList({ projects, session, allUsers }: { projects: Project[]; session: Session; allUsers?: any[] }) {
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="group relative bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col h-full"
                    >
                        <Link
                            href={`/projects/${project.id}`}
                            className="absolute inset-0 z-0"
                            aria-label={`View ${project.name}`}
                        />
                        <div className="p-6 flex flex-col h-full relative z-10 pointer-events-none">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-slate-50 text-blue-600 rounded-xl group-hover:bg-white group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ease-out border border-transparent group-hover:border-slate-100">
                                    {project.imageUrl ? (
                                        <img src={project.imageUrl} alt={project.name} className="w-8 h-8 object-contain" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" /></svg>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">
                                        {project._count.tasks} Tasks
                                    </span>
                                    {session.role === 'ADMIN' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setEditingProject(project);
                                            }}
                                            className="pointer-events-auto p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-all"
                                            title="Edit Details"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {project.name}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4" title={project.description || ''}>
                                {project.description || 'No description provided.'}
                            </p>
                            <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                <div className="flex gap-1">
                                    {project.users.map((user) => {
                                        const isAdmin = user.role === 'ADMIN';

                                        // Colors: Admin = Emerald (Green), User = Slate (Gray/Default)
                                        const bgClass = isAdmin ? 'bg-emerald-100' : 'bg-slate-100';
                                        const textClass = isAdmin ? 'text-emerald-700' : 'text-slate-500';
                                        const ringClass = isAdmin ? 'ring-emerald-100' : 'ring-slate-100';

                                        return (
                                            <div
                                                key={user.id}
                                                className={`w-6 h-6 rounded-full border border-white flex items-center justify-center text-[10px] font-bold uppercase ring-1 ${bgClass} ${textClass} ${ringClass}`}
                                                title={`${user.username} (${user.role})`}
                                            >
                                                {user.username.substring(0, 2)}
                                            </div>
                                        );
                                    })}
                                </div>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <p className="text-slate-500">No projects found for your account.</p>
                </div>
            )}

            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    allUsers={allUsers || []}
                    currentUser={session.username}
                />
            )}
        </>
    );
}
