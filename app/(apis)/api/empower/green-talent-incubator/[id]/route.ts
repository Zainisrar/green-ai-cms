import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerGreenTalentIncubator, EmpowerGreenTalentIncubatorInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific green talent incubator data by ID
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
            .from(empowerGreenTalentIncubator)
            .where(eq(empowerGreenTalentIncubator.id, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Green Talent Incubator data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/empower/green-talent-incubator/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch green talent incubator data'
        }, { status: 500 });
    }
}

// PUT - Update specific green talent incubator data by ID
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

        // Ensure arrays are properly formatted
        const greenTalentData: Partial<EmpowerGreenTalentIncubatorInsert> = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', headline: '' },
                quote1: body.mainPage.quote1 || { text: '', highlighted: '' },
                quote2: body.mainPage.quote2 || { text: '', highlighted: '' },
                cta: Array.isArray(body.mainPage.cta) ? body.mainPage.cta : [],
            },
            modals: {
                whyWeBuiltThis: body.modals.whyWeBuiltThis || {
                    title: '',
                    description: '',
                    key: { title: '', items: [] },
                    quote: { text: '', highlighted: '' }
                },
                whatWeOffer: body.modals.whatWeOffer || {
                    title: '',
                    items: []
                },
                ourModel: body.modals.ourModel || {
                    title: { step1: '', step2: '', step3: '' },
                    description: '',
                    key: [],
                    quote: { text: '', highlighted: '' }
                },
                partnerWithUs: body.modals.partnerWithUs || {
                    title: '',
                    description: '',
                    keys: []
                },
                alumniVoices: body.modals.alumniVoices || {
                    title: '',
                    voices: { text1: '', text2: '' }
                }
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(empowerGreenTalentIncubator)
            .set(greenTalentData)
            .where(eq(empowerGreenTalentIncubator.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Green Talent Incubator data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/empower/green-talent-incubator/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update green talent incubator data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific green talent incubator data by ID
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
            .delete(empowerGreenTalentIncubator)
            .where(eq(empowerGreenTalentIncubator.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Green Talent Incubator data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Green Talent Incubator data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/empower/green-talent-incubator/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete green talent incubator data'
        }, { status: 500 });
    }
}