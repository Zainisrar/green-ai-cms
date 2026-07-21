import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemBecomeSupplier, EcosystemBecomeSupplierInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemBecomeSupplier).orderBy(ecosystemBecomeSupplier.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ error: 'No become a supplier data found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching become a supplier:', error);
        return NextResponse.json({ error: 'Failed to fetch become a supplier' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body: EcosystemBecomeSupplierInsert = await request.json();
        
        const [newData] = await db.insert(ecosystemBecomeSupplier).values(body).returning();
        
        return NextResponse.json(newData, { status: 201 });
    } catch (error) {
        console.error('Error creating become a supplier:', error);
        return NextResponse.json({ error: 'Failed to create become a supplier' }, { status: 500 });
    }
}