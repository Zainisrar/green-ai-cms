import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const folder: string = (data.get('folder') as string) || 'uploads';

        if (!file) {
            return NextResponse.json({ 
                success: false, 
                error: 'No file uploaded' 
            }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadImageToCloudinary(buffer, folder);

        return NextResponse.json({
            success: true,
            data: {
                url: result.url,
                publicId: result.publicId
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to upload file' 
        }, { status: 500 });
    }
}