import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemOurProcurementPhilosophy, EcosystemOurProcurementPhilosophyInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const [data] = await db.select().from(ecosystemOurProcurementPhilosophy).where(eq(ecosystemOurProcurementPhilosophy.id, id));
        
        if (!data) {
            return NextResponse.json({ error: 'Procurement philosophy not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching procurement philosophy:', error);
        return NextResponse.json({ error: 'Failed to fetch procurement philosophy' }, { status: 500 });
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

        const body: Partial<EcosystemOurProcurementPhilosophyInsert> = await request.json();
        
        const [updatedData] = await db
            .update(ecosystemOurProcurementPhilosophy)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(ecosystemOurProcurementPhilosophy.id, id))
            .returning();
        
        if (!updatedData) {
            return NextResponse.json({ error: 'Procurement philosophy not found' }, { status: 404 });
        }

        return NextResponse.json(updatedData);
    } catch (error) {
        console.error('Error updating procurement philosophy:', error);
        return NextResponse.json({ error: 'Failed to update procurement philosophy' }, { status: 500 });
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
            .delete(ecosystemOurProcurementPhilosophy)
            .where(eq(ecosystemOurProcurementPhilosophy.id, id))
            .returning();
        
        if (!deletedData) {
            return NextResponse.json({ error: 'Procurement philosophy not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Procurement philosophy deleted successfully' });
    } catch (error) {
        console.error('Error deleting procurement philosophy:', error);
        return NextResponse.json({ error: 'Failed to delete procurement philosophy' }, { status: 500 });
    }
}