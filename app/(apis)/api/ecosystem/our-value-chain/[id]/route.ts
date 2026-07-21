import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemOurValueChain, EcosystemOurValueChainInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const data = await db
            .select()
            .from(ecosystemOurValueChain)
            .where(eq(ecosystemOurValueChain.id, id))
            .limit(1);

        if (data.length === 0) {
            return NextResponse.json(
                { error: 'Data not found' },
                { status: 404 }
            );
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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const id = parseInt(params.id);
        const body = await request.json();

        const updateData: Partial<EcosystemOurValueChainInsert> = {
            title: body.title,
            subHeadline: body.subHeadline,
            description: body.description,
            quote: body.quote,
            cta: body.cta,
            valueChainStrip: body.valueChainStrip,
            updatedAt: new Date(),
        };

        const result = await db
            .update(ecosystemOurValueChain)
            .set(updateData)
            .where(eq(ecosystemOurValueChain.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Data not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating ecosystem value chain data:', error);
        return NextResponse.json(
            { error: 'Failed to update data' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const id = parseInt(params.id);
        
        const result = await db
            .delete(ecosystemOurValueChain)
            .where(eq(ecosystemOurValueChain.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Data not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting ecosystem value chain data:', error);
        return NextResponse.json(
            { error: 'Failed to delete data' },
            { status: 500 }
        );
    }
}