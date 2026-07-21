import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerJoinUs, EmpowerJoinUsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific join-us data by ID
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

        const result = await db
            .select()
            .from(empowerJoinUs)
            .where(eq(empowerJoinUs.id, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Join Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/empower/join-us/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch join-us data'
        }, { status: 500 });
    }
}

// PUT - Update specific join-us data by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'empower', 'edit');
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

        // Validate required fields
        const requiredFields = ['title', 'subHeadline', 'description', 'existingUsersCtaLink', 'newUsersCtaLink'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({
                    success: false,
                    error: `${field} is required`
                }, { status: 400 });
            }
        }

        // Ensure arrays are properly formatted
        const joinUsData: Partial<EmpowerJoinUsInsert> = {
            title: body.title,
            subHeadline: body.subHeadline,
            description: body.description,
            existingUsersCtaLink: body.existingUsersCtaLink,
            newUsersCtaLink: body.newUsersCtaLink,
            quote: body.quote || { text: '', link: '' },
            cta: Array.isArray(body.cta) ? body.cta : [],
            keys: Array.isArray(body.keys) ? body.keys : [],
            dataPolicyEthics: body.dataPolicyEthics || { title: '', description: '' },
            email: body.email || { text: '', href: '' },
            phone: body.phone || { text: '', href: '' },
            updatedAt: new Date(),
        };

        const result = await db
            .update(empowerJoinUs)
            .set(joinUsData)
            .where(eq(empowerJoinUs.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Join Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/empower/join-us/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update join-us data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific join-us data by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'empower', 'delete');
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

        const result = await db
            .delete(empowerJoinUs)
            .where(eq(empowerJoinUs.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Join Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Join Us data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/empower/join-us/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete join-us data'
        }, { status: 500 });
    }
}