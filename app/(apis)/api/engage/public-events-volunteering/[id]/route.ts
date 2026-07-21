import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engagePublicEventsVolunteering, EngagePublicEventsVolunteeringInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific public events volunteering data by ID
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
            .from(engagePublicEventsVolunteering)
            .where(eq(engagePublicEventsVolunteering.id, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Public Events Volunteering data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/engage/public-events-volunteering/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch public events volunteering data'
        }, { status: 500 });
    }
}

// PUT - Update specific public events volunteering data by ID
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
        const publicEventsVolunteeringData: Partial<EngagePublicEventsVolunteeringInsert> = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', highlighted: '' },
                quote: body.mainPage.quote || { text: '', highlighted: '' },
                cta: Array.isArray(body.mainPage.cta) ? body.mainPage.cta : [],
            },
            modals: {
                whyWeEngage: {
                    title: body.modals.whyWeEngage?.title || '',
                    subHeadline: body.modals.whyWeEngage?.subHeadline || '',
                    img: body.modals.whyWeEngage?.img || { src: '', alt: '' },
                    quote: body.modals.whyWeEngage?.quote || { text: '', highlighted: '' },
                    content: body.modals.whyWeEngage?.content || ''
                },
                waysGetInvolved: {
                    title: body.modals.waysGetInvolved?.title || '',
                    download: body.modals.waysGetInvolved?.download || { text: '', href: '' },
                    items: Array.isArray(body.modals.waysGetInvolved?.items) ? body.modals.waysGetInvolved.items : []
                },
                whoCanJoin: {
                    title: body.modals.whoCanJoin?.title || '',
                    items: Array.isArray(body.modals.whoCanJoin?.items) ? body.modals.whoCanJoin.items : []
                },
                volunteerSignUp: {
                    title: body.modals.volunteerSignUp?.title || '',
                    items: Array.isArray(body.modals.volunteerSignUp?.items) ? body.modals.volunteerSignUp.items : [],
                    quote: body.modals.volunteerSignUp?.quote || { text: '', highlighted: '' }
                },
                pastHighlights: {
                    title: body.modals.pastHighlights?.title || '',
                    items: Array.isArray(body.modals.pastHighlights?.items) ? body.modals.pastHighlights.items : [],
                    browse: body.modals.pastHighlights?.browse || { text: '', highlighted: '' }
                }
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(engagePublicEventsVolunteering)
            .set(publicEventsVolunteeringData)
            .where(eq(engagePublicEventsVolunteering.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Public Events Volunteering data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/engage/public-events-volunteering/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update public events volunteering data'
        }, { status: 500 });
    }
}

// PATCH - Partially update specific public events volunteering data by ID
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
                .from(engagePublicEventsVolunteering)
                .where(eq(engagePublicEventsVolunteering.id, id))
                .limit(1);

            if (existing.length === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Public Events Volunteering data not found'
                }, { status: 404 });
            }

            // Merge the modal data
            updateData.modals = {
                ...existing[0].modals,
                ...body.modals
            };
        }

        const result = await db
            .update(engagePublicEventsVolunteering)
            .set(updateData)
            .where(eq(engagePublicEventsVolunteering.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Public Events Volunteering data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PATCH /api/engage/public-events-volunteering/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update public events volunteering data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific public events volunteering data by ID
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
            .delete(engagePublicEventsVolunteering)
            .where(eq(engagePublicEventsVolunteering.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Public Events Volunteering data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Public Events Volunteering data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/engage/public-events-volunteering/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete public events volunteering data'
        }, { status: 500 });
    }
}