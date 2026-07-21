import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerCommunityVoices, EmpowerCommunityVoicesInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific community voices data by ID
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
            .from(empowerCommunityVoices)
            .where(eq(empowerCommunityVoices.id, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Community Voices data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/empower/community-voices/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch community voices data'
        }, { status: 500 });
    }
}

// PUT - Update specific community voices data by ID
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
        const communityVoicesData: Partial<EmpowerCommunityVoicesInsert> = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', highlighted: '' },
                quote1: body.mainPage.quote1 || { text1: '', highlighted1: '', text2: '', highlighted2: '' },
                quote2: body.mainPage.quote2 || { text: '', highlighted: '' },
                cta: body.mainPage.cta || { text: '', href: '' },
                modals: Array.isArray(body.mainPage.modals) ? body.mainPage.modals : [],
            },
            modals: {
                voicesFromField: body.modals.voicesFromField || {
                    title: '',
                    items: []
                },
                whatMakesOurImpactDifferent: body.modals.whatMakesOurImpactDifferent || {
                    title: '',
                    key1: { title: '', items: [] },
                    key2: { title: '', items: [] }
                }
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(empowerCommunityVoices)
            .set(communityVoicesData)
            .where(eq(empowerCommunityVoices.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Community Voices data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/empower/community-voices/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update community voices data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific community voices data by ID
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
            .delete(empowerCommunityVoices)
            .where(eq(empowerCommunityVoices.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Community Voices data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Community Voices data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/empower/community-voices/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete community voices data'
        }, { status: 500 });
    }
}