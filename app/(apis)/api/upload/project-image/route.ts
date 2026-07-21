import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // Validate file size (5MB limit for images)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'Image too large. Maximum size is 5MB' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadImageToCloudinary(buffer, 'endeavors/projects');

        return NextResponse.json({
            url: result.url,
            publicId: result.publicId,
            originalName: file.name,
            size: file.size,
        });
    } catch (error) {
        console.error('Project image upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}