import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemClientPartnerships, EcosystemClientPartnershipsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const data = await db
            .select()
            .from(ecosystemClientPartnerships)
            .where(eq(ecosystemClientPartnerships.id, id))
            .limit(1);

        if (data.length === 0) {
            return NextResponse.json({ 
                error: 'Client partnerships data not found' 
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
        
        if (isNaN(id)) {
            return NextResponse.json({ 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const body = await request.json();
        
        const updateData: Partial<EcosystemClientPartnershipsInsert> = {
            mainPage: body.mainPage,
            whoWePartnerWith: body.whoWePartnerWith,
            ourClientPartnership: body.ourClientPartnership,
            whatSetsGreenApart: body.whatSetsGreenApart,
            useCases: body.useCases,
            trustedBy: body.trustedBy,
        };

        const result = await db
            .update(ecosystemClientPartnerships)
            .set(updateData)
            .where(eq(ecosystemClientPartnerships.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ 
                error: 'Client partnerships data not found' 
            }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating client partnerships data:', error);
        return NextResponse.json({ 
            error: 'Failed to update client partnerships data' 
        }, { status: 500 });
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
        
        if (isNaN(id)) {
            return NextResponse.json({ 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const result = await db
            .delete(ecosystemClientPartnerships)
            .where(eq(ecosystemClientPartnerships.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ 
                error: 'Client partnerships data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Client partnerships data deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting client partnerships data:', error);
        return NextResponse.json({ 
            error: 'Failed to delete client partnerships data' 
        }, { status: 500 });
    }
}