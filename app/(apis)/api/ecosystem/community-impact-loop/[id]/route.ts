import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemCommunityImpactLoop } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await db.select().from(ecosystemCommunityImpactLoop).where(eq(ecosystemCommunityImpactLoop.id, id));
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching community impact loop data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        
        const [updatedData] = await db
            .update(ecosystemCommunityImpactLoop)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(ecosystemCommunityImpactLoop.id, id))
            .returning();

        if (!updatedData) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(updatedData);
    } catch (error) {
        console.error('Error updating community impact loop data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const [deletedData] = await db
            .delete(ecosystemCommunityImpactLoop)
            .where(eq(ecosystemCommunityImpactLoop.id, id))
            .returning();

        if (!deletedData) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting community impact loop data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}