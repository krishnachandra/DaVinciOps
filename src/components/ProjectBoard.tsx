"use client";

import { useState } from 'react';
import { updateTaskStatus, createTask, deleteTask } from '@/app/actions';

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: string | Date;
};

const COLUMNS = [
    { id: 'TO_START', label: 'To Start', color: 'bg-slate-100 border-slate-200' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 border-blue-100' },
    { id: 'COMPLETED', label: 'Completed', color: 'bg-green-50 border-green-100' },
];

export function ProjectBoard({ project, tasks }: { project: any, tasks: Task[] }) {
    const [isCreating, setIsCreating] = useState(false);

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
                        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
                    >
                        <h3 className="text-lg font-bold mb-4">Create New Task</h3>
                        <input type="hidden" name="projectId" value={project.id} />
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input name="title" required className="w-full border rounded-lg p-2" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" className="w-full border rounded-lg p-2" rows={3} />
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

    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 group hover:border-blue-300 transition-all ${isPending ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-slate-800 text-sm">{task.title}</h4>
                <button onClick={handleDelete} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                </button>
            </div>
            {task.description && (
                <p className="text-xs text-slate-500 mb-3">{task.description}</p>
            )}

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                <div className="text-[10px] text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString()}
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
        </div>
    );
}
