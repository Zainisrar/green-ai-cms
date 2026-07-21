import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerCareersAtGreen } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const careersData = await db
            .select()
            .from(empowerCareersAtGreen)
            .where(eq(empowerCareersAtGreen.id, parseInt(params.id)))
            .limit(1);

        if (careersData.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Careers at green data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: careersData[0]
        });

    } catch (error) {
        console.error('Get careers at green by ID error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch careers at green data' 
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requirePermission(request, 'empower', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const deletedCareers = await db
            .delete(empowerCareersAtGreen)
            .where(eq(empowerCareersAtGreen.id, parseInt(params.id)))
            .returning();

        if (deletedCareers.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Careers at green data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Careers at green data deleted successfully',
            data: deletedCareers[0]
        });

    } catch (error) {
        console.error('Delete careers at green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete careers at green data' 
        }, { status: 500 });
    }
}