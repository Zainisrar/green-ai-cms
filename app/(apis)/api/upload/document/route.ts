import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'documents';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // No file type validation - accept all files

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadFileToCloudinary(buffer, folder);

        return NextResponse.json({
            success: true,
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        console.error('Document upload error:', error);
        return NextResponse.json({ success: false, error: 'Failed to upload document' }, { status: 500 });
    }
}