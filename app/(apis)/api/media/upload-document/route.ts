import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaFiles } from '@/db/schema';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

// Allowed document formats (non-image/non-video)
const ALLOWED_FORMATS = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'csv', 'json', 'xml', 'zip', 'rar', '7z',
    'tar', 'gz', 'md', 'rtf', 'odt', 'ods', 'odp'
];

const MIME_TYPE_MAP: { [key: string]: string } = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    md: 'text/markdown',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odp: 'application/vnd.oasis.opendocument.presentation',
};

function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function getMimeType(extension: string): string {
    return MIME_TYPE_MAP[extension] || 'application/octet-stream';
}

function getCategoryFromExtension(extension: string): string {
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'md'].includes(extension)) {
        return 'document';
    }
    if (['xls', 'xlsx', 'csv', 'json', 'xml', 'ods'].includes(extension)) {
        return 'data';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return 'archive';
    }
    if (['ppt', 'pptx', 'odp'].includes(extension)) {
        return 'presentation';
    }
    return 'other';
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const folder = (formData.get('folder') as string) || 'documents';
        const userId = formData.get('userId') as string;
        const tags = formData.get('tags') as string;
        const description = formData.get('description') as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploadResults = [];
        const errors = [];

        for (const file of files) {
            try {
                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                    errors.push({
                        filename: file.name,
                        error: `File size exceeds 100MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
                    });
                    continue;
                }

                // Get file extension and validate format
                const extension = getFileExtension(file.name);
                if (!extension || !ALLOWED_FORMATS.includes(extension)) {
                    errors.push({
                        filename: file.name,
                        error: `File format not allowed. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`
                    });
                    continue;
                }

                // Generate unique filename
                const timestamp = Date.now();
                const uniqueFilename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                // Read file and convert to base64
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const base64Data = buffer.toString('base64');

                // Save file data and metadata to database
                const mimeType = getMimeType(extension);
                const category = getCategoryFromExtension(extension);
                const parsedTags = tags ? JSON.parse(tags) : [];

                const [dbRecord] = await db.insert(mediaFiles).values({
                    originalFilename: file.name,
                    storedFilename: uniqueFilename,
                    cloudinaryPublicId: null,
                    cloudinaryUrl: null,
                    fileExtension: extension,
                    mimeType: mimeType,
                    fileSize: file.size,
                    storageType: 'database',
                    serverPath: null,
                    fileData: base64Data,
                    category: category,
                    folder: folder,
                    uploadedBy: userId ? parseInt(userId) : null,
                    description: description || null,
                    tags: parsedTags,
                }).returning();

                uploadResults.push({
                    success: true,
                    filename: file.name,
                    serverPath: `/api/media/download/${dbRecord.id}`,
                    publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/media/download/${dbRecord.id}`,
                    dbId: dbRecord.id,
                    size: file.size,
                    extension: extension,
                    category: category,
                });
            } catch (error: any) {
                errors.push({
                    filename: file.name,
                    error: error.message || 'Upload failed'
                });
            }
        }

        return NextResponse.json({
            success: uploadResults.length > 0,
            uploaded: uploadResults,
            errors: errors,
            message: `${uploadResults.length} file(s) uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload files' },
            { status: 500 }
        );
    }
}
