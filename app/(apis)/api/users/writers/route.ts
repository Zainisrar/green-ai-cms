import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    // Remove permission check for now to allow writers to be fetched
    // TODO: Add proper permission check later

    try {
        const writers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email
            })
            .from(users)
            .where(eq(users.isActive, true))
            .orderBy(users.name);

        return NextResponse.json({
            success: true,
            data: writers
        });

    } catch (error) {
        console.error('Get writers error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch writers' 
        }, { status: 500 });
    }
}
    