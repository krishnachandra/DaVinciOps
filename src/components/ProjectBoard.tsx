"use client";

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { updateTaskStatus, createTask, deleteTask, updateTask } from '@/app/actions';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';

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

export function ProjectBoard({ project, tasks: initialTasks, currentUser }: { project: any, tasks: Task[], currentUser: string }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isCreating, setIsCreating] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync state with props if server updates
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const tasksByStatus = useMemo(() => {
        const acc: Record<string, Task[]> = {
            TO_START: [],
            IN_PROGRESS: [],
            COMPLETED: []
        };
        tasks.forEach(task => {
            if (acc[task.status]) {
                acc[task.status].push(task);
            }
        });
        return acc;
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Calculate tomorrow's date for default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the containers
        const activeTask = tasks.find(t => t.id === activeId);
        const overTask = tasks.find(t => t.id === overId);

        if (!activeTask) return;

        const activeStatus = activeTask.status;

        const overStatus = overTask
            ? overTask.status
            : (COLUMNS.find(c => c.id === overId)?.id || null);

        if (!overStatus || activeStatus === overStatus) {
            return;
        }

        // Dropping into a different container
        setTasks((prev) => {
            const activeItems = prev.filter(t => t.status === activeStatus);
            const overItems = prev.filter(t => t.status === overStatus);

            const activeIndex = activeItems.findIndex(t => t.id === activeId);
            const overIndex = overTask ? overItems.findIndex(t => t.id === overId) : overItems.length + 1;

            let newIndex;
            if (overTask) {
                newIndex = overIndex; // replace/insert before
            } else {
                newIndex = overItems.length + 1; // append
            }

            return prev.map(t => {
                if (t.id === activeId) {
                    return { ...t, status: overStatus };
                }
                return t;
            });
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) {
            setActiveId(null);
            return;
        }

        const overTask = tasks.find(t => t.id === overId);
        const newStatus = overTask
            ? overTask.status
            : (COLUMNS.find(c => c.id === overId)?.id || activeTask.status);

        if (activeTask.status !== newStatus) {
            setTasks((prev) => {
                return prev.map(t => t.id === activeId ? { ...t, status: newStatus } : t);
            });

            await updateTaskStatus(activeId, newStatus, project.id);
        }

        setActiveId(null);
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 transform group-hover:-translate-x-1 transition-transform">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Projects
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
                    <p className="text-slate-500 text-sm">{project.description}</p>
                    {project.users && project.users.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            {project.users.map((u: any) => (
                                <div key={u.id} className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border shadow-sm transition-colors cursor-default ${u.role === 'ADMIN'
                                    ? 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}>
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase ${u.role === 'ADMIN'
                                            ? 'bg-indigo-200 text-indigo-800'
                                            : 'bg-slate-200 text-slate-700'
                                            }`}
                                    >
                                        {u.username.substring(0, 2)}
                                    </div>
                                    <span className={`text-xs font-medium ${u.role === 'ADMIN' ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {u.username}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
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
                        {/* Create Task Form Header */}
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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-6 min-w-[800px] h-full pb-4">
                        {COLUMNS.map(col => (
                            <DroppableContainer
                                key={col.id}
                                id={col.id}
                                className={`flex-1 min-w-[300px] rounded-xl border ${col.color} p-4 flex flex-col`}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-slate-700">{col.label}</h3>
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-xs text-slate-500 font-medium">
                                        {tasksByStatus[col.id]?.length || 0}
                                    </span>
                                </div>

                                <SortableContext
                                    id={col.id}
                                    items={tasksByStatus[col.id] || []}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar min-h-[100px]">
                                        {tasksByStatus[col.id]?.map(task => (
                                            <SortableTaskItem key={task.id} task={task} projectId={project.id} currentUser={currentUser} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DroppableContainer>
                        ))}
                    </div>
                </div>

                {mounted && createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId ? (
                            <TaskCard
                                task={tasks.find(t => t.id === activeId)!}
                                projectId={project.id}
                                currentUser={currentUser}
                                isOverlay
                            />
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}

function DroppableContainer({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { setNodeRef } = useDroppable({ id });
    return <div ref={setNodeRef} className={className}>{children}</div>;
}

function SortableTaskItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.task.id,
        data: {
            type: 'Task',
            task: props.task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard {...props} />
        </div>
    );
}

function TaskCard({ task, projectId, currentUser, isOverlay }: { task: Task, projectId: string, currentUser: string, isOverlay?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // If overlay, prevent interactions
    if (isOverlay) {
        return (
            <div className={`bg-white p-4 rounded-lg shadow-xl ring-2 ring-blue-500 cursor-grabbing border border-blue-200`}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-slate-800 flex-1 pr-2 leading-snug">
                        {task.title}
                    </span>
                </div>
            </div>
        )
    }

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
        <div className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 group hover:border-blue-300 transition-all ${task.isSoftDeleted ? 'opacity-60 grayscale bg-slate-50' : 'cursor-grab active:cursor-grabbing'}`}>

            {/* Header: Title, Priority & Delete */}
            <div className="flex justify-between items-start mb-2">
                <span
                    onClick={(e) => {
                        setIsExpanded(!isExpanded)
                    }}
                    className={`text-sm font-medium text-slate-800 flex-1 pr-2 leading-snug hover:text-blue-600 ${isExpanded ? '' : 'line-clamp-2'}`}
                >
                    {task.title}
                    {task.isSoftDeleted && <span className="text-red-500 text-[10px] uppercase font-bold ml-2">(Deleted)</span>}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-1" onPointerDown={(e) => e.stopPropagation()}>
                    <span className="text-xs tracking-tighter cursor-help" title={`Priority: ${task.priority}`}>
                        {priorityIcons}
                    </span>
                    {!task.isSoftDeleted && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-500 hover:text-blue-600 transition-colors p-1"
                            title="Edit Task"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={task.isSoftDeleted && currentUser !== 'nkc'}
                        className={`transition-colors p-1 ${task.isSoftDeleted && currentUser !== 'nkc' ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-red-500 hover:text-red-600'}`}
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
                        className={`text-xs text-slate-500 leading-relaxed cursor-pointer hover:text-slate-700 break-all ${isExpanded ? '' : 'line-clamp-2'}`}
                    >
                        {task.description}
                    </p>
                ) : (
                    <p className="text-xs text-slate-300 italic">No description provided</p>
                )}
            </div>

            {/* Footer: Dates  */}
            <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-50">
                <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-slate-400">
                        Created: {formatDate(task.createdAt)}
                    </div>
                    {task.dueDate && (
                        <div className="text-[10px] text-red-500 font-medium">
                            Due: {formatDate(task.dueDate)}
                        </div>
                    )}
                    {task.status === 'COMPLETED' && task.completedAt && (
                        <div className="text-[10px] text-green-600 font-medium">
                            Completed: {formatDate(task.completedAt)}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Form Modal */}
            {
                isEditing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-left cursor-default" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
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
