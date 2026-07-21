import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db } from '@/db';
import { chatbotTraining } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;

        if (!file || !title) {
            return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.' }, { status: 400 });
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size too large. Maximum size is 10MB.' }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = join(uploadsDir, fileName);
        const publicPath = `/uploads/${fileName}`;

        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save to database with initial processing status
        const [result] = await db
            .insert(chatbotTraining)
            .values({
                title,
                fileName: file.name,
                filePath: publicPath,
                fileSize: file.size,
                chunks: 0,
                status: 'processing',
            })
            .returning();

        let chunks = 0;
        let finalStatus = 'processing';

        // Call external API for processing
        try {
            // Create FormData for external API call
            const externalFormData = new FormData();
            externalFormData.append('file', new Blob([buffer], { type: file.type }), file.name);

            console.log('Calling external API for file processing...');

            const response = await fetch('https://api.infina.greendigitall.com/upload', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                },
                body: externalFormData,
            });

            if (response.ok) {
                const apiResult = await response.json();
                chunks = apiResult.chunks || 0;
                finalStatus = 'completed';

                console.log('External API response:', apiResult);

                // Update database with results from external API
                await db
                    .update(chatbotTraining)
                    .set({
                        chunks,
                        status: finalStatus,
                        updatedAt: new Date(),
                    })
                    .where(eq(chatbotTraining.id, result.id));
            } else {
                console.error('External API call failed with status:', response.status);
                finalStatus = 'failed';

                // Update status to failed
                await db
                    .update(chatbotTraining)
                    .set({
                        status: finalStatus,
                        updatedAt: new Date(),
                    })
                    .where(eq(chatbotTraining.id, result.id));
            }
        } catch (error) {
            console.error('External API call failed:', error);
            finalStatus = 'failed';

            // Update status to failed
            await db
                .update(chatbotTraining)
                .set({
                    status: finalStatus,
                    updatedAt: new Date(),
                })
                .where(eq(chatbotTraining.id, result.id));
        }

        return NextResponse.json({
            message:
                finalStatus === 'completed' ? 'File uploaded and processed successfully' : finalStatus === 'failed' ? 'File uploaded but processing failed' : 'File uploaded, processing in progress',
            id: result.id,
            file_path: publicPath,
            chunks,
            status: finalStatus,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
