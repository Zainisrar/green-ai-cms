import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enlightenThoughtLeadership, users } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { desc, eq, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const thoughtLeadershipData = await db
            .select()
            .from(enlightenThoughtLeadership)
            .orderBy(desc(enlightenThoughtLeadership.updatedAt))
            .limit(1);

        if (!thoughtLeadershipData[0]) {
            return NextResponse.json({
                success: true,
                data: {
                    id: null,
                    editorials: [],
                    mainPage: {
                        title: 'Thought Leadership',
                        subTitle: 'Industry Insights',
                        description: 'Expert perspectives on the future of green energy and sustainability.',
                        editorialsTitle: 'Latest Editorials',
                        quote: { text: 'Leading the conversation in sustainable energy', highlighted: 'sustainable energy' },
                        cta: []
                    }
                }
            });
        }

        const data = thoughtLeadershipData[0];
        
        // Get unique writer IDs from editorials (handle both number IDs and user objects)
        const writerIds = Array.from(new Set(
            data.editorials
                .map((editorial: any) => {
                    // Handle case where writer is already a user object
                    if (typeof editorial.writer === 'object' && editorial.writer?.id) {
                        return editorial.writer.id;
                    }
                    // Handle case where writer is just an ID
                    return editorial.writer;
                })
                .filter((id: any) => typeof id === 'number' && id > 0)
        ));
        
        // Fetch writer details only if we have valid IDs
        let writers: { id: number; name: string; email: string }[] = [];
        if (writerIds.length > 0) {
            writers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email
                })
                .from(users)
                .where(inArray(users.id, writerIds));
        }

        // Create a map for quick lookup
        const writerMap = new Map(writers.map(writer => [writer.id, writer]));

        // Replace writer IDs with writer objects in editorials
        const editorialsWithWriters = data.editorials.map((editorial: any) => ({
            ...editorial,
            writer: writerMap.get(editorial.writer) || { id: editorial.writer, name: 'Unknown User', email: '' }
        }));

        return NextResponse.json({
            success: true,
            data: {
                ...data,
                editorials: editorialsWithWriters
            }
        });

    } catch (error) {
        console.error('Get thought leadership error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch thought leadership data' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requirePermission(request, 'content', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { editorials, mainPage } = await request.json();

        if (!editorials || !mainPage) {
            return NextResponse.json({ 
                success: false, 
                error: 'Editorials and main page data are required' 
            }, { status: 400 });
        }

        const newThoughtLeadershipData = await db.insert(enlightenThoughtLeadership).values({
            editorials,
            mainPage
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Thought leadership data created successfully',
            data: newThoughtLeadershipData[0]
        });

    } catch (error) {
        console.error('Create thought leadership error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create thought leadership data' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const authResult = await requirePermission(request, 'content', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id, editorials, mainPage } = await request.json();

        if (!id) {
            return NextResponse.json({ 
                success: false, 
                error: 'ID is required for update' 
            }, { status: 400 });
        }

        const updateData: any = {
            updatedAt: new Date()
        };

        if (editorials) updateData.editorials = editorials;
        if (mainPage) updateData.mainPage = mainPage;

        const updatedThoughtLeadershipData = await db
            .update(enlightenThoughtLeadership)
            .set(updateData)
            .where(eq(enlightenThoughtLeadership.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Thought leadership data updated successfully',
            data: updatedThoughtLeadershipData[0]
        });

    } catch (error) {
        console.error('Update thought leadership error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update thought leadership data' 
        }, { status: 500 });
    }
}