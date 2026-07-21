import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemKeySupplyCategories, EcosystemKeySupplyCategoriesInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemKeySupplyCategories).orderBy(ecosystemKeySupplyCategories.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'No key supply categories data found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching key supply categories:', error);
        return NextResponse.json({ error: 'Failed to fetch key supply categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body: EcosystemKeySupplyCategoriesInsert = await request.json();
        
        const [newData] = await db.insert(ecosystemKeySupplyCategories).values(body).returning();
        
        return NextResponse.json(newData, { status: 201 });
    } catch (error) {
        console.error('Error creating key supply categories:', error);
        return NextResponse.json({ error: 'Failed to create key supply categories' }, { status: 500 });
    }
}