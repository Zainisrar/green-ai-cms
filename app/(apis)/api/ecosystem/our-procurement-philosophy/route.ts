import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemOurProcurementPhilosophy, EcosystemOurProcurementPhilosophyInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemOurProcurementPhilosophy).orderBy(ecosystemOurProcurementPhilosophy.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'No procurement philosophy data found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching procurement philosophy:', error);
        return NextResponse.json({ error: 'Failed to fetch procurement philosophy' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body: EcosystemOurProcurementPhilosophyInsert = await request.json();
        
        const [newData] = await db.insert(ecosystemOurProcurementPhilosophy).values(body).returning();
        
        return NextResponse.json(newData, { status: 201 });
    } catch (error) {
        console.error('Error creating procurement philosophy:', error);
        return NextResponse.json({ error: 'Failed to create procurement philosophy' }, { status: 500 });
    }
}