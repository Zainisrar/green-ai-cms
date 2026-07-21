import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enlightenReportsWhitepapers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';



export async function GET() {
    try {
        const reports = await db.select().from(enlightenReportsWhitepapers).orderBy(desc(enlightenReportsWhitepapers.createdAt));
        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error fetching reports and whitepapers:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, subtitle, description, featuredImg, year, pptx } = body;

        if (!title || !subtitle || !year || !pptx) {
            return NextResponse.json({ error: 'Title, subtitle, year, and pptx file are required' }, { status: 400 });
        }

        const newReport = await db
            .insert(enlightenReportsWhitepapers)
            .values({
                title,
                subtitle,
                description: description || null,
                featuredImg: featuredImg || null,
                year,
                pptx,
            })
            .returning();

        return NextResponse.json(newReport[0], { status: 201 });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, subtitle, description, featuredImg, year, pptx } = body;

        if (!id) {
            return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
        }

        if (!title || !subtitle || !year || !pptx) {
            return NextResponse.json({ error: 'Title, subtitle, year, and pptx file are required' }, { status: 400 });
        }

        const updatedReport = await db
            .update(enlightenReportsWhitepapers)
            .set({
                title,
                subtitle,
                description: description || null,
                featuredImg: featuredImg || null,
                year,
                pptx,
                updatedAt: new Date(),
            })
            .where(eq(enlightenReportsWhitepapers.id, id))
            .returning();

        if (updatedReport.length === 0) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json(updatedReport[0]);
    } catch (error) {
        console.error('Error updating report:', error);
        return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
        }

        const deletedReport = await db
            .delete(enlightenReportsWhitepapers)
            .where(eq(enlightenReportsWhitepapers.id, parseInt(id)))
            .returning();

        if (deletedReport.length === 0) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
    }
}