import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemImpactMeasurementESG, EcosystemImpactMeasurementESGInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemImpactMeasurementESG).orderBy(ecosystemImpactMeasurementESG.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching ecosystem impact measurement ESG data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body = await request.json();
        
        const insertData: EcosystemImpactMeasurementESGInsert = {
            mainPage: body.mainPage,
            whyEsgMattersGreen: body.whyEsgMattersGreen,
            esgIntegrationProjectLifeCycle: body.esgIntegrationProjectLifeCycle,
            trustSignals: body.trustSignals,
            sampleMetricsSnapshot: body.sampleMetricsSnapshot,
            howWeMeasureImpact: body.howWeMeasureImpact,
        };

        const result = await db.insert(ecosystemImpactMeasurementESG).values(insertData).returning();
        
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error creating ecosystem impact measurement ESG data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}