import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePath = params.path.join('/');
        const fullPath = join(process.cwd(), 'public', 'uploads', filePath);

        if (!existsSync(fullPath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileBuffer = await readFile(fullPath);
        
        // Get file extension and set appropriate content type
        const extension = filePath.split('.').pop()?.toLowerCase() || '';
        const mimeTypes: { [key: string]: string } = {
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

        const contentType = mimeTypes[extension] || 'application/octet-stream';

        return new NextResponse(fileBuffer as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filePath.split('/').pop()}"`,
            },
        });
    } catch (error: any) {
        console.error('File serving error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to serve file' },
            { status: 500 }
        );
    }
}
