import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enlightenMediaMentions } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const mediaMentionsData = await db
            .select()
            .from(enlightenMediaMentions)
            .orderBy(desc(enlightenMediaMentions.updatedAt))
            .limit(1);

        return NextResponse.json({
            success: true,
            data: mediaMentionsData[0] || null
        });

    } catch (error) {
        console.error('Get media mentions error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch media mentions data' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requirePermission(request, 'enlighten', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { mainPage } = await request.json();

        if (!mainPage || !mainPage.title || !mainPage.subHeadline) {
            return NextResponse.json({ 
                success: false, 
                error: 'Main page with title and subHeadline are required' 
            }, { status: 400 });
        }

        const newMediaMentions = await db.insert(enlightenMediaMentions).values({
            mainPage
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Media mentions data created successfully',
            data: newMediaMentions[0]
        });

    } catch (error) {
        console.error('Create media mentions error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create media mentions data' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const authResult = await requirePermission(request, 'enlighten', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id, mainPage } = await request.json();

        if (!id) {
            return NextResponse.json({ 
                success: false, 
                error: 'ID is required for update' 
            }, { status: 400 });
        }

        const updateData: any = {
            updatedAt: new Date()
        };

        if (mainPage) updateData.mainPage = mainPage;

        const updatedMediaMentions = await db
            .update(enlightenMediaMentions)
            .set(updateData)
            .where(eq(enlightenMediaMentions.id, parseInt(id)))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Media mentions data updated successfully',
            data: updatedMediaMentions[0]
        });

    } catch (error) {
        console.error('Update media mentions error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update media mentions data' 
        }, { status: 500 });
    }
}