import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemSupplyPartners, EcosystemSupplyPartnersInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemSupplyPartners).orderBy(ecosystemSupplyPartners.createdAt).limit(1);
        
        if (data.length === 0) {
            // Return default structure if no data exists
            const defaultData = {
                id: 0,
                mainPage: {
                    title: '',
                    subHeadline: '',
                    description: { text: '', highlighted: '' },
                    quote: { text: '', highlighted: '' },
                    cta: [],
                    partnerSpotlight: { icons: [], text: '' }
                },
                globalSourcingStrategy: {
                    title: '',
                    headline: '',
                    description: '',
                    keyPoints: []
                },
                whatWeProcure: {
                    title: '',
                    item: []
                },
                howBecomeGreenSupplier: {
                    title: '',
                    subHeadline: '',
                    item: []
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return NextResponse.json(defaultData);
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

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        
        const insertData: EcosystemSupplyPartnersInsert = {
            mainPage: body.mainPage,
            globalSourcingStrategy: body.globalSourcingStrategy,
            whatWeProcure: body.whatWeProcure,
            howBecomeGreenSupplier: body.howBecomeGreenSupplier,
        };

        // Check if data already exists
        const existingData = await db.select().from(ecosystemSupplyPartners).orderBy(ecosystemSupplyPartners.createdAt).limit(1);
        
        let result;
        if (existingData.length > 0) {
            // Update existing record
            result = await db
                .update(ecosystemSupplyPartners)
                .set({ ...insertData, updatedAt: new Date() })
                .where(eq(ecosystemSupplyPartners.id, existingData[0].id))
                .returning();
        } else {
            // Insert new record
            result = await db.insert(ecosystemSupplyPartners).values(insertData).returning();
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error saving ecosystem supply partners data:', error);
        return NextResponse.json(
            { error: 'Failed to save data' },
            { status: 500 }
        );
    }
}