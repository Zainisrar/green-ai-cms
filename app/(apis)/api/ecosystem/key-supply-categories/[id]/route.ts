import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemKeySupplyCategories, EcosystemKeySupplyCategoriesInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const [data] = await db.select().from(ecosystemKeySupplyCategories).where(eq(ecosystemKeySupplyCategories.id, id));
        
        if (!data) {
            return NextResponse.json({ error: 'Key supply categories not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching key supply categories:', error);
        return NextResponse.json({ error: 'Failed to fetch key supply categories' }, { status: 500 });
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

        const body: Partial<EcosystemKeySupplyCategoriesInsert> = await request.json();
        
        const [updatedData] = await db
            .update(ecosystemKeySupplyCategories)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(ecosystemKeySupplyCategories.id, id))
            .returning();
        
        if (!updatedData) {
            return NextResponse.json({ error: 'Key supply categories not found' }, { status: 404 });
        }

        return NextResponse.json(updatedData);
    } catch (error) {
        console.error('Error updating key supply categories:', error);
        return NextResponse.json({ error: 'Failed to update key supply categories' }, { status: 500 });
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
            .delete(ecosystemKeySupplyCategories)
            .where(eq(ecosystemKeySupplyCategories.id, id))
            .returning();
        
        if (!deletedData) {
            return NextResponse.json({ error: 'Key supply categories not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Key supply categories deleted successfully' });
    } catch (error) {
        console.error('Error deleting key supply categories:', error);
        return NextResponse.json({ error: 'Failed to delete key supply categories' }, { status: 500 });
    }
}