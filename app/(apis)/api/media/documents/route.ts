import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaFiles } from '@/db/schema';
import { desc, eq, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const folder = searchParams.get('folder');
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where conditions
        const conditions = [];
        
        if (folder) {
            conditions.push(eq(mediaFiles.folder, folder));
        }
        
        if (category) {
            conditions.push(eq(mediaFiles.category, category));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(mediaFiles.originalFilename, `%${search}%`),
                    ilike(mediaFiles.description, `%${search}%`),
                    ilike(mediaFiles.fileExtension, `%${search}%`)
                )
            );
        }

        // Build the query
        let files;
        if (conditions.length > 0) {
            const whereCondition = conditions.length === 1 
                ? conditions[0] 
                : conditions.reduce((a, b) => or(a, b) as any);
            
            files = await db
                .select()
                .from(mediaFiles)
                .where(whereCondition)
                .orderBy(desc(mediaFiles.createdAt))
                .limit(limit)
                .offset(offset);
        } else {
            files = await db
                .select()
                .from(mediaFiles)
                .orderBy(desc(mediaFiles.createdAt))
                .limit(limit)
                .offset(offset);
        }

        return NextResponse.json({
            success: true,
            files: files,
            count: files.length,
        });
    } catch (error: any) {
        console.error('Fetch documents error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
