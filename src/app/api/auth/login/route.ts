import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const user = await prisma.user.findUnique({
            where: { username },
        });

        // Simple password check (MVP) - In prod use bcrypt
        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await signToken({
            id: user.id,
            username: user.username,
            role: user.role,
        });

        const response = NextResponse.json({ success: true });

        // Set cookie
        response.cookies.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
