"use client";

import Link from 'next/link';
import { LogoutButton } from './LogoutButton';
import { SettingsModal } from './SettingsModal';
import { useState } from 'react';

type NavbarProps = {
    session: {
        username: string;
        role: string;
    } | null;
    users?: any[];
};

export function Navbar({ session, users = [] }: NavbarProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const isAdmin = session?.username === 'nkc';

    return (
        <>
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link href="/" className="flex-shrink-0 flex items-center">
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-slate-800 tracking-tight leading-none">DaVinci<span className="text-blue-600">Ops</span></span>
                                    {isAdmin ? (
                                        <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase mt-0.5">Admin</span>
                                    ) : (
                                        <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase mt-0.5">User</span>
                                    )}
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex flex-col items-end mr-4">
                                <span className="text-sm font-medium text-slate-700">{session?.username as string}</span>
                            </div>

                            {/* Kebab Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Menu"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                    </svg>
                                </button>

                                {showMenu && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowMenu(false)}
                                        />

                                        {/* Menu Dropdown */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setShowSettings(true);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="3" />
                                                        <path d="M12 1v6m0 6v6M5.636 5.636l4.243 4.243m4.242 4.242l4.243 4.243M1 12h6m6 0h6M5.636 18.364l4.243-4.243m4.242-4.242l4.243-4.243" />
                                                    </svg>
                                                    Settings
                                                </button>
                                            )}

                                            {isAdmin && <div className="border-t border-slate-100 my-1"></div>}

                                            <button
                                                onClick={async () => {
                                                    await fetch("/api/auth/logout", { method: "POST" });
                                                    window.location.href = "/login";
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                    <polyline points="16 17 21 12 16 7"></polyline>
                                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                                </svg>
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {showSettings && (
                <SettingsModal
                    users={users}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    );
}

