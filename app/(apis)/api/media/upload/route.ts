import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary, uploadFileToCloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth-middleware';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const data = await request.formData();
        const files = data.getAll('files') as File[];
        const folder = (data.get('folder') as string) || 'media-library';
        const resourceType = (data.get('resourceType') as string) || 'auto'; // auto, image, video, raw

        if (!files || files.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'No files uploaded' 
            }, { status: 400 });
        }

        const uploadPromises = files.map(async (file) => {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Determine resource type based on file mime type if auto
            let uploadResourceType = resourceType;
            if (resourceType === 'auto') {
                if (file.type.startsWith('image/')) {
                    uploadResourceType = 'image';
                } else if (file.type.startsWith('video/')) {
                    uploadResourceType = 'video';
                } else {
                    uploadResourceType = 'raw';
                }
            }

            // Upload based on resource type
            return new Promise((resolve, reject) => {
                const uploadOptions: any = {
                    folder,
                    resource_type: uploadResourceType,
                };

                cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else if (result) {
                            resolve({
                                url: result.secure_url,
                                publicId: result.public_id,
                                resourceType: result.resource_type,
                                format: result.format,
                                bytes: result.bytes,
                                width: result.width,
                                height: result.height,
                                createdAt: result.created_at,
                            });
                        } else {
                            reject(new Error('Upload failed'));
                        }
                    }
                ).end(buffer);
            });
        });

        const results = await Promise.all(uploadPromises);

        return NextResponse.json({
            success: true,
            data: {
                files: results
            }
        });

    } catch (error: any) {
        console.error('Multi upload error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to upload files' 
        }, { status: 500 });
    }
}
