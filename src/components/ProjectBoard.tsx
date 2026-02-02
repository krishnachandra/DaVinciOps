"use client";

import { useState } from 'react';
import { updateTaskStatus, createTask, deleteTask, updateTask } from '@/app/actions';

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: string | Date;
    dueDate: string | Date | null;
    priority: number;
    completedAt: string | Date | null;
    isSoftDeleted: boolean;
};

const COLUMNS = [
    { id: 'TO_START', label: 'To Start', color: 'bg-slate-100 border-slate-200' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 border-blue-100' },
    { id: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-100' },
];

export function ProjectBoard({ project, tasks }: { project: any, tasks: Task[] }) {
    const [isCreating, setIsCreating] = useState(false);

    // Calculate tomorrow's date for default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Group tasks by status
    const tasksByStatus = COLUMNS.reduce((acc, col) => {
        acc[col.id] = tasks.filter(t => t.status === col.id);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
                    <p className="text-slate-500 text-sm">{project.description}</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    + New Task
                </button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <form
                        action={async (formData) => {
                            await createTask(formData);
                            setIsCreating(false);
                        }}
                        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Create New Task</h3>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <input type="hidden" name="projectId" value={project.id} />

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                            <input name="title" required className="w-full border rounded-lg p-2" placeholder="Task title" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" className="w-full border rounded-lg p-2" rows={3} placeholder="Add details..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Due Date <span className="text-red-500">*</span></label>
                                <input type="date" name="dueDate" defaultValue={tomorrowStr} required className="w-full border rounded-lg p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Priority <span className="text-red-500">*</span></label>
                                <select name="priority" className="w-full border rounded-lg p-2">
                                    <option value="1">🔥 Low</option>
                                    <option value="2">🔥🔥 Medium</option>
                                    <option value="3">🔥🔥🔥 High</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Image Upload</label>
                            <input type="file" disabled className="w-full border rounded-lg p-2 bg-slate-50 cursor-not-allowed opacity-60" />
                            <p className="text-xs text-slate-400 mt-1">Uploads disabled for now</p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 min-w-[800px] h-full pb-4">
                    {COLUMNS.map(col => (
                        <div key={col.id} className={`flex-1 min-w-[300px] rounded-xl border ${col.color} p-4 flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-slate-700">{col.label}</h3>
                                <span className="bg-white/50 px-2 py-0.5 rounded text-xs text-slate-500 font-medium">
                                    {tasksByStatus[col.id]?.length || 0}
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                                {tasksByStatus[col.id]?.map(task => (
                                    <TaskCard key={task.id} task={task} projectId={project.id} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TaskCard({ task, projectId }: { task: Task, projectId: string }) {
    const [isPending, setIsPending] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const moveTask = async (newStatus: string) => {
        setIsPending(true);
        await updateTaskStatus(task.id, newStatus, projectId);
        setIsPending(false);
    };

    const nextStatus = {
        'TO_START': 'IN_PROGRESS',
        'IN_PROGRESS': 'COMPLETED',
    }[task.status];

    const prevStatus = {
        'IN_PROGRESS': 'TO_START',
        'COMPLETED': 'IN_PROGRESS',
    }[task.status];

    const handleDelete = async () => {
        if (confirm('Are you sure?')) {
            await deleteTask(task.id, projectId);
        }
    }

    // Priority Display
    const priorityIcons = (
        <div className="flex gap-[1px]">
            {[1, 2, 3].map((level) => (
                <span
                    key={level}
                    className={`text-[10px] leading-none select-none transition-all ${level <= (task.priority || 1)
                        ? 'opacity-100 grayscale-0'
                        : 'opacity-25 grayscale'
                        }`}
                >
                    🔥
                </span>
            ))}
        </div>
    );

    // Date formatting
    const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 group hover:border-blue-300 transition-all ${isPending ? 'opacity-50' : ''} ${task.isSoftDeleted ? 'opacity-60 grayscale bg-slate-50' : ''}`}>

            {/* Header: Title, Priority & Delete */}
            <div className="flex justify-between items-start mb-2">
                <span
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`text-sm font-medium text-slate-800 flex-1 pr-2 leading-snug cursor-pointer hover:text-blue-600 ${isExpanded ? '' : 'line-clamp-2'}`}
                    title={isExpanded ? "" : task.title}
                >
                    {task.title}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-1">
                    <span className="text-xs tracking-tighter cursor-help" title={`Priority: ${task.priority}`}>
                        {priorityIcons}
                    </span>
                    {!task.isSoftDeleted && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-slate-300 hover:text-blue-500 transition-colors p-1"
                            title="Edit Task"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete Task"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content Section: Description */}
            <div className="min-h-[2.5em] mb-3">
                {task.description ? (
                    <p
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`text-xs text-slate-500 leading-relaxed cursor-pointer hover:text-slate-700 ${isExpanded ? '' : 'line-clamp-2'}`}
                        title={isExpanded ? "" : task.description}
                    >
                        {task.description}
                    </p>
                ) : (
                    <p className="text-xs text-slate-300 italic">No description provided</p>
                )}
            </div>

            {/* Footer: Dates & Actions */}
            <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-50">
                <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-slate-400">
                        Created: {formatDate(task.createdAt)}
                    </div>
                    {task.dueDate && (
                        <div className="text-[10px] text-slate-500 font-medium">
                            Due: {formatDate(task.dueDate)}
                        </div>
                    )}
                    {task.status === 'COMPLETED' && task.completedAt && (
                        <div className="text-[10px] text-green-600 font-medium">
                            Completed: {formatDate(task.completedAt)}
                        </div>
                    )}
                </div>

                <div className="flex gap-1">
                    {prevStatus && (
                        <button
                            disabled={isPending}
                            onClick={() => moveTask(prevStatus)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                            title="Move Back"
                        >
                            ←
                        </button>
                    )}
                    {nextStatus && (
                        <button
                            disabled={isPending}
                            onClick={() => moveTask(nextStatus)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                            title="Move Forward"
                        >
                            →
                        </button>
                    )}
                </div>
            </div>

            {
                isEditing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-left cursor-default" onClick={(e) => e.stopPropagation()}>
                        <form
                            action={async (formData) => {
                                await updateTask(formData);
                                setIsEditing(false);
                            }}
                            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Edit Task</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <input type="hidden" name="taskId" value={task.id} />
                            <input type="hidden" name="projectId" value={projectId} />

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                                <input name="title" defaultValue={task.title} required className="w-full border rounded-lg p-2" />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea name="description" defaultValue={task.description || ''} className="w-full border rounded-lg p-2" rows={3} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                        required
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority <span className="text-red-500">*</span></label>
                                    <select name="priority" defaultValue={task.priority} className="w-full border rounded-lg p-2">
                                        <option value="1">🔥 Low</option>
                                        <option value="2">🔥🔥 Medium</option>
                                        <option value="3">🔥🔥🔥 High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>
                )
            }
        </div >
    );
}
