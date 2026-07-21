import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userNotifications } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    try {
        // Create a test notification
        const testNotifications = [
            {
                title: 'Welcome!',
                message: 'Welcome to the Green Energy Management System',
                type: 'success'
            },
            {
                title: 'System Update',
                message: 'New features have been added to the platform',
                type: 'info'
            },
            {
                title: 'Maintenance Notice',
                message: 'Scheduled maintenance will occur this weekend',
                type: 'warning'
            }
        ];

        const createdNotifications = [];
        
        for (const notification of testNotifications) {
            const newNotification = await db.insert(userNotifications).values({
                userId: authResult.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                isRead: false
            }).returning();
            
            createdNotifications.push(newNotification[0]);
        }

        return NextResponse.json({
            success: true,
            message: 'Test notifications created successfully',
            data: createdNotifications
        });

    } catch (error) {
        console.error('Create test notifications error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create test notifications' 
        }, { status: 500 });
    }
}