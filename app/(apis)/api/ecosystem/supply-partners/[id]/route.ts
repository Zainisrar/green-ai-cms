import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemSupplyPartners, EcosystemSupplyPartnersInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const data = await db
            .select()
            .from(ecosystemSupplyPartners)
            .where(eq(ecosystemSupplyPartners.id, id))
            .limit(1);

        if (data.length === 0) {
            return NextResponse.json(
                { error: 'Data not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching ecosystem supply partners data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
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
        const body = await request.json();

        const updateData: Partial<EcosystemSupplyPartnersInsert> = {
            mainPage: body.mainPage,
            globalSourcingStrategy: body.globalSourcingStrategy,
            whatWeProcure: body.whatWeProcure,
            howBecomeGreenSupplier: body.howBecomeGreenSupplier,
            updatedAt: new Date(),
        };

        const result = await db
            .update(ecosystemSupplyPartners)
            .set(updateData)
            .where(eq(ecosystemSupplyPartners.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Data not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating ecosystem supply partners data:', error);
        return NextResponse.json(
            { error: 'Failed to update data' },
            { status: 500 }
        );
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
        
        const result = await db
            .delete(ecosystemSupplyPartners)
            .where(eq(ecosystemSupplyPartners.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Data not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting ecosystem supply partners data:', error);
        return NextResponse.json(
            { error: 'Failed to delete data' },
            { status: 500 }
        );
    }
}