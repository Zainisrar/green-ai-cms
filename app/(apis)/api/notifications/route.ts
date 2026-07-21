import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userNotifications } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const notifications = await db
            .select()
            .from(userNotifications)
            .where(eq(userNotifications.userId, authResult.id))
            .orderBy(desc(userNotifications.createdAt));

        return NextResponse.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch notifications' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { title, message, type = 'info' } = await request.json();

        if (!title || !message) {
            return NextResponse.json({ 
                success: false, 
                error: 'Title and message are required' 
            }, { status: 400 });
        }

        const newNotification = await db.insert(userNotifications).values({
            userId: authResult.id,
            title,
            message,
            type,
            isRead: false
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Notification created successfully',
            data: newNotification[0]
        });

    } catch (error) {
        console.error('Create notification error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create notification' 
        }, { status: 500 });
    }
}