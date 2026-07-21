import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enlightenMediaMentions } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const mediaMentionId = parseInt(params.id);
        
        const mediaMention = await db
            .select()
            .from(enlightenMediaMentions)
            .where(eq(enlightenMediaMentions.id, mediaMentionId))
            .limit(1);

        if (!mediaMention[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Media mentions data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: mediaMention[0]
        });

    } catch (error) {
        console.error('Get media mentions error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch media mentions data' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requirePermission(request, 'enlighten', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const mediaMentionId = parseInt(params.id);
        const { mainPage } = await request.json();

        // Check if media mentions data exists
        const existingMediaMention = await db.select().from(enlightenMediaMentions).where(eq(enlightenMediaMentions.id, mediaMentionId)).limit(1);
        if (!existingMediaMention[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Media mentions data not found' 
            }, { status: 404 });
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (mainPage) updateData.mainPage = mainPage;

        // Update media mentions data
        const updatedMediaMention = await db
            .update(enlightenMediaMentions)
            .set(updateData)
            .where(eq(enlightenMediaMentions.id, mediaMentionId))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Media mentions data updated successfully',
            data: updatedMediaMention[0]
        });

    } catch (error) {
        console.error('Update media mentions error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update media mentions data' 
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requirePermission(request, 'enlighten', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const mediaMentionId = parseInt(params.id);

        // Check if media mentions data exists
        const existingMediaMention = await db.select().from(enlightenMediaMentions).where(eq(enlightenMediaMentions.id, mediaMentionId)).limit(1);
        if (!existingMediaMention[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Media mentions data not found' 
            }, { status: 404 });
        }

        // Delete media mentions data
        await db.delete(enlightenMediaMentions).where(eq(enlightenMediaMentions.id, mediaMentionId));

        return NextResponse.json({
            success: true,
            message: 'Media mentions data deleted successfully'
        });

    } catch (error) {
        console.error('Delete media mentions error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete media mentions data' 
        }, { status: 500 });
    }
}