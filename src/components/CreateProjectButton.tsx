"use client";

import { useState } from 'react';
import { createProject } from '@/app/actions';
import { ImageUpload } from './ImageUpload';

export function CreateProjectButton({ currentUser, users }: { currentUser: string, users: any[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    if (currentUser !== 'nkc') return null;

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const closeAndReset = () => {
        setIsCreating(false);
        setSelectedUserIds([]);
        setName('');
        setDescription('');
        setImageUrl(null);
    };

    return (
        <>
            <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                + New Project
            </button>

            {isCreating && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={closeAndReset}
                >
                    <div
                        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Create New Project</h3>
                            <button
                                onClick={closeAndReset}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form
                            action={async (formData) => {
                                await createProject(formData);
                                closeAndReset();
                            }}
                            className="space-y-4"
                        >
                            <input type="hidden" name="userIds" value={JSON.stringify(selectedUserIds)} />

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="block text-sm font-medium">Project Name <span className="text-red-500">*</span></label>
                                    <span className={`text-xs ${name.length === 30 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{name.length}/30</span>
                                </div>
                                <input
                                    name="name"
                                    required
                                    className="w-full border rounded-lg p-2"
                                    placeholder="e.g. Website Redesign"
                                    maxLength={30}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="block text-sm font-medium">Description <span className="text-red-500">*</span></label>
                                    <span className={`text-xs ${description.length === 150 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{description.length}/150</span>
                                </div>
                                <textarea
                                    name="description"
                                    required
                                    className="w-full border rounded-lg p-2 resize-none"
                                    rows={3}
                                    placeholder="Brief description of the project..."
                                    maxLength={150}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <ImageUpload onImageSelected={setImageUrl} />
                                <input type="hidden" name="imageUrl" value={imageUrl || ''} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Assign Team Members (Optional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {users.filter(u => u.username !== currentUser).map(user => (
                                        <button
                                            type="button"
                                            key={user.id}
                                            onClick={() => toggleUser(user.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedUserIds.includes(user.id)
                                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {user.username} {selectedUserIds.includes(user.id) && '✓'}
                                        </button>
                                    ))}
                                    {users.filter(u => u.username !== currentUser).length === 0 && (
                                        <span className="text-xs text-slate-400 italic">No other users available.</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeAndReset} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Project</button>
                            </div>
                        </form>
                    </div >
                </div >
            )
            }
        </>
    );
}
