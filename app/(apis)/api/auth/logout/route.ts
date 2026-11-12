import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSessions } from '@/db/schema';
import { getTokenFromRequest } from '@/lib/jwt';
import { eq } from 'drizzle-orm';
import { usesSecureAuthCookie } from '@/lib/auth-cookie';

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        
        if (token) {
            // Remove session from database
            await db.delete(userSessions).where(eq(userSessions.token, token));
        }

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

        // Clear cookie
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: usesSecureAuthCookie(request),
            sameSite: 'strict',
            maxAge: 0
        });

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Logout failed' 
        }, { status: 500 });
    }
}
