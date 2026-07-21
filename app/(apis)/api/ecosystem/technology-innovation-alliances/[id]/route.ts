import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemTechnologyInnovationAlliances } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const [data] = await db
            .select()
            .from(ecosystemTechnologyInnovationAlliances)
            .where(eq(ecosystemTechnologyInnovationAlliances.id, id));

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching technology innovation alliances:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        
        const [updatedRecord] = await db
            .update(ecosystemTechnologyInnovationAlliances)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(ecosystemTechnologyInnovationAlliances.id, id))
            .returning();

        if (!updatedRecord) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedRecord });
    } catch (error) {
        console.error('Error updating technology innovation alliances:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update data' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        
        await db
            .delete(ecosystemTechnologyInnovationAlliances)
            .where(eq(ecosystemTechnologyInnovationAlliances.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting technology innovation alliances:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete data' },
            { status: 500 }
        );
    }
}
