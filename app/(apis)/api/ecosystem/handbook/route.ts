import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemHandbook } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemHandbook).orderBy(ecosystemHandbook.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'No ecosystem handbook data found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching ecosystem handbook:', error);
        return NextResponse.json({ error: 'Failed to fetch ecosystem handbook' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body = await request.json();
        
        const newData = await db.insert(ecosystemHandbook).values({
            mainPage: body.mainPage,
            ourProcurementEthos: body.ourProcurementEthos,
            codeOfConduct: body.codeOfConduct,
        }).returning();

        return NextResponse.json(newData[0], { status: 201 });
    } catch (error) {
        console.error('Error creating ecosystem handbook:', error);
        return NextResponse.json({ error: 'Failed to create ecosystem handbook' }, { status: 500 });
    }
}