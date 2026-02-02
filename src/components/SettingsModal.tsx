"use client";

import { useState, useEffect } from 'react';
import { createUser, deleteUser, updateUser } from '@/app/actions';

type User = {
    id: string;
    username: string;
    name?: string | null;
    email?: string | null;
    password?: string;
    role: string;
    createdAt?: string | Date;
};

type ViewMode = 'LIST' | 'FORM';

export function SettingsModal({ users, onClose }: { users: User[]; onClose: () => void }) {
    const [viewMode, setViewMode] = useState<ViewMode>('LIST');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form State
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const resetForm = () => {
        setUsername('');
        setName('');
        setEmail('');
        setPassword('');
        setRepeatPassword('');
        setError('');
        setEditingUser(null);
        setShowPassword(false);
        setShowRepeatPassword(false);
    };

    const handleBackToList = () => {
        setViewMode('LIST');
        // Small delay to reset form after slide out
        setTimeout(resetForm, 300);
    };

    const handleAddUserClick = () => {
        resetForm();
        setViewMode('FORM');
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setUsername(user.username);
        setName(user.name || '');
        setEmail(user.email || '');
        setPassword(user.password || '');
        setRepeatPassword(user.password || '');
        setViewMode('FORM');
    };

    const handleSubmit = async (formData: FormData) => {
        setError('');

        const nameVal = formData.get('userName') as string; // We'll stick to 'username' input for login id, and 'fullName' for Name
        // Actually, let's just append 'name' to the formdata in the form submit
        if (name) formData.append('name', name);
        const emailVal = formData.get('email') as string;
        const pwd = formData.get('password') as string;
        const repeatPwd = formData.get('repeatPassword') as string;

        if (!validateEmail(emailVal)) {
            setError('Please enter a valid email address');
            return;
        }

        if (editingUser) {
            // For edit, password is optional (only if changing)
            if (pwd && pwd !== repeatPwd) {
                setError('Passwords do not match');
                return;
            }
            if (pwd && pwd.length < 4) {
                setError('Password must be at least 4 characters');
                return;
            }
        } else {
            // For create, password is required
            if (!pwd) {
                setError('Password is required');
                return;
            }
            if (pwd !== repeatPwd) {
                setError('Passwords do not match');
                return;
            }
            if (pwd.length < 4) {
                setError('Password must be at least 4 characters');
                return;
            }
        }

        if (editingUser) {
            formData.append('userId', editingUser.id);
            await updateUser(formData);
        } else {
            await createUser(formData);
        }

        handleBackToList();
    };

    const handleDelete = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteUser(userId);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 z-10 bg-white">
                    <div className="flex items-center gap-3">
                        {viewMode === 'FORM' && (
                            <button
                                onClick={handleBackToList}
                                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors -ml-2"
                                title="Go Back"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                        )}
                        <h3 className="text-xl font-bold text-slate-800">
                            {viewMode === 'LIST' ? 'Users and Roles' : (editingUser ? 'Edit User' : 'Add New User')}
                        </h3>
                    </div>
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

                {/* Content Container - Use flex to hold both slides but they are absolute positioned */}
                <div>

                    {/* LIST PANEL */}
                    {viewMode === 'LIST' && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-slate-700">Existing Users</h4>
                                <button
                                    onClick={handleAddUserClick}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                >
                                    + Add User
                                </button>
                            </div>

                            <div className="space-y-2">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-slate-800">
                                                    <span className="font-semibold text-slate-500">Name:</span> {user.name || user.username}
                                                    <span className="mx-2 text-slate-300">|</span>
                                                    <span className="font-semibold text-slate-500">Login Id:</span> {user.username}
                                                </span>
                                                {user.role === 'ADMIN' ? (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ml-2">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ml-2">
                                                        User
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 pl-[1px]">
                                                Created: {new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                title="Edit user"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                                </svg>
                                            </button>
                                            {user.username !== 'nkc' && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Delete user"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FORM PANEL (Add/Edit) */}
                    {viewMode === 'FORM' && (
                        <div className="p-6">
                            {error && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                                    <input
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="block text-sm font-medium text-slate-700">Login Id <span className="text-red-500">*</span></label>
                                        <span className={`text-xs ${username.length === 5 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{username.length}/5</span>
                                    </div>
                                    <input
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        maxLength={5}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {editingUser ? 'New Password (leave blank to keep current)' : 'Password'} {(!editingUser) && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                            required={!editingUser}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Repeat {editingUser ? 'New ' : ''}Password {(!editingUser) && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="repeatPassword"
                                            type={showRepeatPassword ? "text" : "password"}
                                            value={repeatPassword}
                                            onChange={(e) => setRepeatPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                            required={!editingUser}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showRepeatPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleBackToList}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
