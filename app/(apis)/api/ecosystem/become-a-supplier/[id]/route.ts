import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemBecomeSupplier, EcosystemBecomeSupplierInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const [data] = await db.select().from(ecosystemBecomeSupplier).where(eq(ecosystemBecomeSupplier.id, id));
        
        if (!data) {
            return NextResponse.json({ error: 'Become a supplier not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching become a supplier:', error);
        return NextResponse.json({ error: 'Failed to fetch become a supplier' }, { status: 500 });
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

        const body: Partial<EcosystemBecomeSupplierInsert> = await request.json();
        
        const [updatedData] = await db
            .update(ecosystemBecomeSupplier)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(ecosystemBecomeSupplier.id, id))
            .returning();
        
        if (!updatedData) {
            return NextResponse.json({ error: 'Become a supplier not found' }, { status: 404 });
        }

        return NextResponse.json(updatedData);
    } catch (error) {
        console.error('Error updating become a supplier:', error);
        return NextResponse.json({ error: 'Failed to update become a supplier' }, { status: 500 });
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
            .delete(ecosystemBecomeSupplier)
            .where(eq(ecosystemBecomeSupplier.id, id))
            .returning();
        
        if (!deletedData) {
            return NextResponse.json({ error: 'Become a supplier not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Become a supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting become a supplier:', error);
        return NextResponse.json({ error: 'Failed to delete become a supplier' }, { status: 500 });
    }
}