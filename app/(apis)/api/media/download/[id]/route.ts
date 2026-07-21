import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = parseInt(params.id);

        if (isNaN(fileId)) {
            return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
        }

        // Fetch file from database
        const [file] = await db
            .select()
            .from(mediaFiles)
            .where(eq(mediaFiles.id, fileId))
            .limit(1);

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        if (!file.fileData) {
            return NextResponse.json({ error: 'File data not available' }, { status: 404 });
        }

        // Convert base64 back to binary
        const buffer = Buffer.from(file.fileData, 'base64');

        // Return file with proper headers
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': file.mimeType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${file.originalFilename}"`,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to download file' },
            { status: 500 }
        );
    }
}
