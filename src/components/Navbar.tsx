import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { LogoutButton } from './LogoutButton';

export async function Navbar() {
    const session = await getSession();

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-slate-800 tracking-tight">DaVinci<span className="text-blue-600">Ops</span></span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex flex-col items-end mr-4">
                            <span className="text-sm font-medium text-slate-700">{session?.username}</span>
                            <span className="text-xs text-slate-500 uppercase">{session?.role}</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
