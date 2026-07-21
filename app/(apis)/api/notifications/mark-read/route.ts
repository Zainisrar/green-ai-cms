import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userNotifications } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';
import { eq, and } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { notificationId } = await request.json();

        if (notificationId) {
            // Mark specific notification as read
            await db
                .update(userNotifications)
                .set({ isRead: true })
                .where(
                    and(
                        eq(userNotifications.id, notificationId),
                        eq(userNotifications.userId, authResult.id)
                    )
                );
        } else {
            // Mark all notifications as read for the user
            await db
                .update(userNotifications)
                .set({ isRead: true })
                .where(eq(userNotifications.userId, authResult.id));
        }

        return NextResponse.json({
            success: true,
            message: notificationId ? 'Notification marked as read' : 'All notifications marked as read'
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to mark notification as read' 
        }, { status: 500 });
    }
}