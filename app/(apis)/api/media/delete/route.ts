import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth-middleware';

export async function DELETE(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { publicId, resourceType } = await request.json();

        if (!publicId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Public ID is required' 
            }, { status: 400 });
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType || 'image'
        });

        if (result.result === 'ok' || result.result === 'not found') {
            return NextResponse.json({
                success: true,
                message: 'File deleted successfully'
            });
        } else {
            throw new Error('Delete operation failed');
        }

    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to delete file' 
        }, { status: 500 });
    }
}
