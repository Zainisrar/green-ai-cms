import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemHandbook } from '@/db/schema';
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

        const data = await db.select().from(ecosystemHandbook).where(eq(ecosystemHandbook.id, id));
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'Ecosystem handbook not found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching ecosystem handbook:', error);
        return NextResponse.json({ error: 'Failed to fetch ecosystem handbook' }, { status: 500 });
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
        
        const updatedData = await db
            .update(ecosystemHandbook)
            .set({
                mainPage: body.mainPage,
                ourProcurementEthos: body.ourProcurementEthos,
                codeOfConduct: body.codeOfConduct,
                updatedAt: new Date(),
            })
            .where(eq(ecosystemHandbook.id, id))
            .returning();

        if (updatedData.length === 0) {
            return NextResponse.json({ error: 'Ecosystem handbook not found' }, { status: 404 });
        }

        return NextResponse.json(updatedData[0]);
    } catch (error) {
        console.error('Error updating ecosystem handbook:', error);
        return NextResponse.json({ error: 'Failed to update ecosystem handbook' }, { status: 500 });
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

        const deletedData = await db
            .delete(ecosystemHandbook)
            .where(eq(ecosystemHandbook.id, id))
            .returning();

        if (deletedData.length === 0) {
            return NextResponse.json({ error: 'Ecosystem handbook not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Ecosystem handbook deleted successfully' });
    } catch (error) {
        console.error('Error deleting ecosystem handbook:', error);
        return NextResponse.json({ error: 'Failed to delete ecosystem handbook' }, { status: 500 });
    }
}