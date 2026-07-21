import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemImpactMeasurementESG, EcosystemImpactMeasurementESGInsert } from '@/db/schema';
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

        const data = await db.select().from(ecosystemImpactMeasurementESG).where(eq(ecosystemImpactMeasurementESG.id, id));
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching ecosystem impact measurement ESG data:', error);
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
        
        const updateData: Partial<EcosystemImpactMeasurementESGInsert> = {
            mainPage: body.mainPage,
            whyEsgMattersGreen: body.whyEsgMattersGreen,
            esgIntegrationProjectLifeCycle: body.esgIntegrationProjectLifeCycle,
            trustSignals: body.trustSignals,
            sampleMetricsSnapshot: body.sampleMetricsSnapshot,
            howWeMeasureImpact: body.howWeMeasureImpact,
            updatedAt: new Date(),
        };

        const result = await db
            .update(ecosystemImpactMeasurementESG)
            .set(updateData)
            .where(eq(ecosystemImpactMeasurementESG.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating ecosystem impact measurement ESG data:', error);
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

        const result = await db
            .delete(ecosystemImpactMeasurementESG)
            .where(eq(ecosystemImpactMeasurementESG.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting ecosystem impact measurement ESG data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}