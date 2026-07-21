import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engagePartnerWithUs, EngagePartnerWithUsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific partner with us data by ID
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
            .from(engagePartnerWithUs)
            .where(eq(engagePartnerWithUs.id, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Partner With Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/engage/partner-with-us/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch partner with us data'
        }, { status: 500 });
    }
}

// PUT - Update specific partner with us data by ID
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
        if (!body.mainPage || !body.modal) {
            return NextResponse.json({
                success: false,
                error: 'mainPage and modal are required'
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

        // Ensure arrays are properly formatted
        const partnerWithUsData: Partial<EngagePartnerWithUsInsert> = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', highlighted: '' },
                key: Array.isArray(body.mainPage.key) ? body.mainPage.key : [],
                quote: body.mainPage.quote || { text: '', highlighted: '' },
                img: body.mainPage.img || { src: '', alt: '' },
                cta: Array.isArray(body.mainPage.cta) ? body.mainPage.cta : [],
            },
            modal: {
                whyGreen: body.modal.whyGreen || {
                    title: '',
                    subHeadline: '',
                    key: [],
                    quote: { text: '', highlighted: '' }
                },
                partnerShipTypes: body.modal.partnerShipTypes || {
                    title: '',
                    subHeadline: '',
                    keys: []
                },
                whatYouCanExpect: body.modal.whatYouCanExpect || {
                    title: '',
                    subHeadline: '',
                    keys: []
                },
                abortionChannels: body.modal.abortionChannels || {
                    title: '',
                    subHeadline: '',
                    key1: { title: '', items: [] },
                    key2: { title: '', items: [] }
                },
                trustedBy: body.modal.trustedBy || {
                    title: '',
                    subHeadline: '',
                    icons: []
                }
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(engagePartnerWithUs)
            .set(partnerWithUsData)
            .where(eq(engagePartnerWithUs.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Partner With Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/engage/partner-with-us/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update partner with us data'
        }, { status: 500 });
    }
}

// PATCH - Partially update specific partner with us data by ID
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

        // If modal is provided, merge it with existing modal data
        if (body.modal) {
            // First get the existing data
            const existing = await db
                .select()
                .from(engagePartnerWithUs)
                .where(eq(engagePartnerWithUs.id, id))
                .limit(1);

            if (existing.length === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Partner With Us data not found'
                }, { status: 404 });
            }

            // Merge the modal data
            updateData.modal = {
                ...existing[0].modal,
                ...body.modal
            };
        }

        const result = await db
            .update(engagePartnerWithUs)
            .set(updateData)
            .where(eq(engagePartnerWithUs.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Partner With Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PATCH /api/engage/partner-with-us/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update partner with us data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific partner with us data by ID
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
            .delete(engagePartnerWithUs)
            .where(eq(engagePartnerWithUs.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Partner With Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Partner With Us data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/engage/partner-with-us/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete partner with us data'
        }, { status: 500 });
    }
}