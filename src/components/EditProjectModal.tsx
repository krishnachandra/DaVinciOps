"use client";

import { useState } from 'react';
import { updateProject } from '@/app/actions';
import { ImageUpload } from './ImageUpload';

type Project = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    users: { id: string; username: string; role: string }[];
};

export function EditProjectModal({
    project,
    onClose,
    allUsers = [],
    currentUser
}: {
    project: Project;
    onClose: () => void;
    allUsers?: any[];
    currentUser?: string;
}) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || '');
    const [imageUrl, setImageUrl] = useState<string | null>(project.imageUrl || null);

    // Initialize selected users (excluding current user)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
        project.users
            .filter(u => u.username !== currentUser)
            .map(u => u.id)
    );

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Edit Project</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form
                    action={async (formData) => {
                        await updateProject(formData);
                        onClose();
                    }}
                    className="space-y-4"
                >
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="userIds" value={JSON.stringify(selectedUserIds)} />

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-700">Project Name</label>
                            <span className={`text-xs ${name.length === 30 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{name.length}/30</span>
                        </div>
                        <input
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={30}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <span className={`text-xs ${description.length === 150 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{description.length}/150</span>
                        </div>
                        <textarea
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={150}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <ImageUpload
                            onImageSelected={setImageUrl}
                            initialImage={project.imageUrl}
                        />
                        <input type="hidden" name="imageUrl" value={imageUrl || ''} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Assign Team Members (Optional)</label>
                        <div className="flex flex-wrap gap-2">
                            {allUsers.filter(u => u.username !== currentUser).map(user => (
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
                            {allUsers.filter(u => u.username !== currentUser).length === 0 && (
                                <span className="text-xs text-slate-400 italic">No other users available.</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
