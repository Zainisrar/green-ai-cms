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
        const folder = searchParams.get('folder') || '';

        if (!folder) {
            return NextResponse.json({ 
                success: false, 
                error: 'Folder parameter is required' 
            }, { status: 400 });
        }

        // Get subfolders for a specific folder
        const result = await cloudinary.api.sub_folders(folder);

        return NextResponse.json({
            success: true,
            data: {
                folders: result.folders || []
            }
        });

    } catch (error: any) {
        console.error('Subfolders list error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to fetch subfolders' 
        }, { status: 500 });
    }
}
