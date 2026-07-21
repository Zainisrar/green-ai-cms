import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemCommunityImpactLoop } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemCommunityImpactLoop).orderBy(ecosystemCommunityImpactLoop.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching community impact loop data:', error);
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
        
        const [newData] = await db.insert(ecosystemCommunityImpactLoop).values(body).returning();
        
        return NextResponse.json(newData, { status: 201 });
    } catch (error) {
        console.error('Error creating community impact loop data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}