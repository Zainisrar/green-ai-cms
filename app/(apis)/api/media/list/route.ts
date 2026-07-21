import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const resourceType = searchParams.get('type') || 'image'; // image, video, raw
        const folder = searchParams.get('folder') || '';
        const maxResults = parseInt(searchParams.get('max_results') || '30');
        const nextCursor = searchParams.get('next_cursor') || undefined;

        const options: any = {
            type: 'upload',
            max_results: maxResults,
            resource_type: resourceType,
        };

        if (folder) {
            options.prefix = folder;
        }

        if (nextCursor) {
            options.next_cursor = nextCursor;
        }

        const result = await cloudinary.api.resources(options);

        return NextResponse.json({
            success: true,
            data: {
                resources: result.resources,
                next_cursor: result.next_cursor,
                total_count: result.total_count,
            }
        });

    } catch (error: any) {
        console.error('Media list error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to fetch media files' 
        }, { status: 500 });
    }
}
