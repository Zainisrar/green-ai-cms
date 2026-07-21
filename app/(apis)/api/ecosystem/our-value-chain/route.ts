import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemOurValueChain, EcosystemOurValueChainInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemOurValueChain).orderBy(ecosystemOurValueChain.createdAt).limit(1);
        
        if (data.length === 0) {
            // Return default structure if no data exists
            const defaultData = {
                id: 0,
                title: '',
                subHeadline: '',
                description: { text: '', highlighted: '' },
                quote: [],
                cta: [],
                valueChainStrip: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return NextResponse.json(defaultData);
        }
        
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching ecosystem value chain data:', error);
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
        
        const insertData: EcosystemOurValueChainInsert = {
            title: body.title,
            subHeadline: body.subHeadline,
            description: body.description,
            quote: body.quote,
            cta: body.cta,
            valueChainStrip: body.valueChainStrip,
        };

        // Check if data already exists
        const existingData = await db.select().from(ecosystemOurValueChain).orderBy(ecosystemOurValueChain.createdAt).limit(1);
        
        let result;
        if (existingData.length > 0) {
            // Update existing record
            result = await db
                .update(ecosystemOurValueChain)
                .set({ ...insertData, updatedAt: new Date() })
                .where(eq(ecosystemOurValueChain.id, existingData[0].id))
                .returning();
        } else {
            // Insert new record
            result = await db.insert(ecosystemOurValueChain).values(insertData).returning();
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error saving ecosystem value chain data:', error);
        return NextResponse.json(
            { error: 'Failed to save data' },
            { status: 500 }
        );
    }
}