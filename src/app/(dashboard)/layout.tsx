import { Navbar } from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    let users: any[] = [];
    if (session?.username === 'nkc') {
        users = await prisma.user.findMany({
            orderBy: { username: 'asc' },
        });
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar
                session={session ? {
                    username: session.username as string,
                    role: session.role as string
                } : null}
                users={users}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
