import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        // Get root folders
        const result = await cloudinary.api.root_folders();

        return NextResponse.json({
            success: true,
            data: {
                folders: result.folders || []
            }
        });

    } catch (error: any) {
        console.error('Folders list error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to fetch folders' 
        }, { status: 500 });
    }
}
