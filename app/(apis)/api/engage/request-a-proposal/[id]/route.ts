import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageRequestProposal } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const data = await db.select().from(engageRequestProposal).where(eq(engageRequestProposal.id, id));
        
        if (data.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Request proposal data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            data: data[0] 
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch request proposal data' 
        }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const body = await request.json();

        // Check if record exists
        const existingData = await db.select().from(engageRequestProposal).where(eq(engageRequestProposal.id, id));
        if (existingData.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Request proposal data not found' 
            }, { status: 404 });
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        // Update fields if provided
        if (body.title !== undefined) updateData.title = body.title;
        if (body.subHeadline !== undefined) updateData.subHeadline = body.subHeadline;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.whoShouldUseThis !== undefined) updateData.whoShouldUseThis = body.whoShouldUseThis;
        if (body.whatGreenDeliversProposal !== undefined) updateData.whatGreenDeliversProposal = body.whatGreenDeliversProposal;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.quote !== undefined) updateData.quote = body.quote;
        if (body.cta !== undefined) updateData.cta = body.cta;

        const result = await db
            .update(engageRequestProposal)
            .set(updateData)
            .where(eq(engageRequestProposal.id, id))
            .returning();

        return NextResponse.json({ 
            success: true, 
            data: result[0] 
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update request proposal data' 
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'delete');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        // Check if record exists
        const existingData = await db.select().from(engageRequestProposal).where(eq(engageRequestProposal.id, id));
        if (existingData.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Request proposal data not found' 
            }, { status: 404 });
        }

        await db.delete(engageRequestProposal).where(eq(engageRequestProposal.id, id));

        return NextResponse.json({ 
            success: true, 
            message: 'Request proposal data deleted successfully' 
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete request proposal data' 
        }, { status: 500 });
    }
}