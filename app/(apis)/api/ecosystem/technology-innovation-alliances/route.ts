import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemTechnologyInnovationAlliances } from '@/db/schema';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemTechnologyInnovationAlliances);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching technology innovation alliances:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const [newRecord] = await db
            .insert(ecosystemTechnologyInnovationAlliances)
            .values(body)
            .returning();
        
        return NextResponse.json({ success: true, data: newRecord });
    } catch (error) {
        console.error('Error creating technology innovation alliances:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create data' },
            { status: 500 }
        );
    }
}
