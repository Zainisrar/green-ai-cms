import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// DELETE: Remove document from database
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        // Get file info from database
        const [file] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Delete from database (file data is stored in the database)
        await db.delete(mediaFiles).where(eq(mediaFiles.id, id));

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete document error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete file' },
            { status: 500 }
        );
    }
}

// PATCH: Update document metadata
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { description, tags, category, folder } = body;

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (description !== undefined) updateData.description = description;
        if (tags !== undefined) updateData.tags = tags;
        if (category !== undefined) updateData.category = category;
        if (folder !== undefined) updateData.folder = folder;

        const [updatedFile] = await db
            .update(mediaFiles)
            .set(updateData)
            .where(eq(mediaFiles.id, id))
            .returning();

        if (!updatedFile) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            file: updatedFile
        });
    } catch (error: any) {
        console.error('Update document error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update file' },
            { status: 500 }
        );
    }
}
