import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enlightenEventsWebinars } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const eventsData = await db.select().from(enlightenEventsWebinars).orderBy(desc(enlightenEventsWebinars.updatedAt)).limit(1);

        return NextResponse.json({
            success: true,
            data: eventsData[0] || null,
        });
    } catch (error) {
        console.error('Get events/webinars error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch events/webinars data',
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requirePermission(request, 'content', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { upcomingEvents, mainPage } = await request.json();

        if (!upcomingEvents || !mainPage) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Upcoming events and main page data are required',
                },
                { status: 400 },
            );
        }

        const newEventsData = await db
            .insert(enlightenEventsWebinars)
            .values({
                upcomingEvents,
                mainPage,
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Events/webinars data created successfully',
            data: newEventsData[0],
        });
    } catch (error) {
        console.error('Create events/webinars error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create events/webinars data',
            },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest) {
    const authResult = await requirePermission(request, 'content', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id, upcomingEvents, mainPage } = await request.json();

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'ID is required for update',
                },
                { status: 400 },
            );
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (upcomingEvents) updateData.upcomingEvents = upcomingEvents;
        if (mainPage) updateData.mainPage = mainPage;

        const updatedEventsData = await db
            .update(enlightenEventsWebinars)
            .set(updateData)
            .where(eq(enlightenEventsWebinars.id, parseInt(id)))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Events/webinars data updated successfully',
            data: updatedEventsData[0],
        });
    } catch (error) {
        console.error('Update events/webinars error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update events/webinars data',
            },
            { status: 500 },
        );
    }
}
