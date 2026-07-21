import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageBookConsultation } from '@/db/schema';
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

        const data = await db.select().from(engageBookConsultation).where(eq(engageBookConsultation.id, id));
        
        if (data.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Book consultation data not found' 
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
            error: 'Failed to fetch book consultation data' 
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
        const existingData = await db.select().from(engageBookConsultation).where(eq(engageBookConsultation.id, id));
        if (existingData.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Book consultation data not found' 
            }, { status: 404 });
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        // Update fields if provided
        if (body.title !== undefined) updateData.title = body.title;
        if (body.subHeadline !== undefined) updateData.subHeadline = body.subHeadline;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.consultationFocusAreas !== undefined) updateData.consultationFocusAreas = body.consultationFocusAreas;
        if (body.bookingDetails !== undefined) updateData.bookingDetails = body.bookingDetails;
        if (body.timings !== undefined) updateData.timings = body.timings;
        if (body.quote !== undefined) updateData.quote = body.quote;
        if (body.cta !== undefined) updateData.cta = body.cta;

        const result = await db
            .update(engageBookConsultation)
            .set(updateData)
            .where(eq(engageBookConsultation.id, id))
            .returning();

        return NextResponse.json({ 
            success: true, 
            data: result[0] 
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update book consultation data' 
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
        const existingData = await db.select().from(engageBookConsultation).where(eq(engageBookConsultation.id, id));
        if (existingData.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Book consultation data not found' 
            }, { status: 404 });
        }

        await db.delete(engageBookConsultation).where(eq(engageBookConsultation.id, id));

        return NextResponse.json({ 
            success: true, 
            message: 'Book consultation data deleted successfully' 
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete book consultation data' 
        }, { status: 500 });
    }
}