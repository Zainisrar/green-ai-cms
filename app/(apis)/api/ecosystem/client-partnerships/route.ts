import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemClientPartnerships, EcosystemClientPartnershipsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemClientPartnerships).orderBy(ecosystemClientPartnerships.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ 
                error: 'No client partnerships data found' 
            }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching client partnerships data:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch client partnerships data' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body = await request.json();
        
        const insertData: EcosystemClientPartnershipsInsert = {
            mainPage: body.mainPage,
            whoWePartnerWith: body.whoWePartnerWith,
            ourClientPartnership: body.ourClientPartnership,
            whatSetsGreenApart: body.whatSetsGreenApart,
            useCases: body.useCases,
            trustedBy: body.trustedBy,
        };

        const result = await db.insert(ecosystemClientPartnerships).values(insertData).returning();
        
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error creating client partnerships data:', error);
        return NextResponse.json({ 
            error: 'Failed to create client partnerships data' 
        }, { status: 500 });
    }
}