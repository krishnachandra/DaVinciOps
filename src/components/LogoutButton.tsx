"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
        >
            Sign out
        </button>
    );
}
