import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageBecomeSupplier, EngageBecomeSupplierInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific become a supplier data by ID
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
            .from(engageBecomeSupplier)
            .where(eq(engageBecomeSupplier.id, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Become a Supplier data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/engage/become-a-supplier/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch become a supplier data'
        }, { status: 500 });
    }
}

// PUT - Update specific become a supplier data by ID
export async function PUT(
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

        // Validate required fields
        if (!body.mainPage || !body.modals) {
            return NextResponse.json({
                success: false,
                error: 'mainPage and modals are required'
            }, { status: 400 });
        }

        // Validate main page required fields
        const mainPageRequiredFields = ['title', 'subHeadline', 'description'];
        for (const field of mainPageRequiredFields) {
            if (!body.mainPage[field]) {
                return NextResponse.json({
                    success: false,
                    error: `mainPage.${field} is required`
                }, { status: 400 });
            }
        }

        // Ensure arrays and objects are properly formatted
        const becomeSupplierData: Partial<EngageBecomeSupplierInsert> = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', highlighted: '' },
                quote1: body.mainPage.quote1 || { text: '', highlighted: '' },
                quote2: body.mainPage.quote2 || { text: '', highlighted: '' },
                cta: Array.isArray(body.mainPage.cta) ? body.mainPage.cta : [],
            },
            modals: {
                whatWeLookFor: body.modals.whatWeLookFor || {
                    title: '',
                    headline: '',
                    keys: [],
                    quote: { text: '', highlighted: '' }
                },
                keySupplyCategories: body.modals.keySupplyCategories || {
                    title: '',
                    headline: '',
                    category: { title: '', items: [] },
                    examples: { title: '', items: [] }
                },
                howGetStarted: body.modals.howGetStarted || {
                    title: '',
                    items: []
                }
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(engageBecomeSupplier)
            .set(becomeSupplierData)
            .where(eq(engageBecomeSupplier.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Become a Supplier data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/engage/become-a-supplier/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update become a supplier data'
        }, { status: 500 });
    }
}

// PATCH - Partially update specific become a supplier data by ID
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

        // For PATCH, we only update the fields that are provided
        const updateData: any = {
            updatedAt: new Date(),
        };

        // If mainPage is provided, update it
        if (body.mainPage) {
            updateData.mainPage = body.mainPage;
        }

        // If modals is provided, merge it with existing modal data
        if (body.modals) {
            // First get the existing data
            const existing = await db
                .select()
                .from(engageBecomeSupplier)
                .where(eq(engageBecomeSupplier.id, id))
                .limit(1);

            if (existing.length === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Become a Supplier data not found'
                }, { status: 404 });
            }

            // Merge the modal data
            updateData.modals = {
                ...existing[0].modals,
                ...body.modals
            };
        }

        const result = await db
            .update(engageBecomeSupplier)
            .set(updateData)
            .where(eq(engageBecomeSupplier.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Become a Supplier data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PATCH /api/engage/become-a-supplier/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update become a supplier data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific become a supplier data by ID
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

        const result = await db
            .delete(engageBecomeSupplier)
            .where(eq(engageBecomeSupplier.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Become a Supplier data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Become a Supplier data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/engage/become-a-supplier/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete become a supplier data'
        }, { status: 500 });
    }
}