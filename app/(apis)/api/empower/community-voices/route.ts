import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerCommunityVoices, EmpowerCommunityVoicesInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch community voices data
export async function GET() {
    try {
        const result = await db.select().from(empowerCommunityVoices).limit(1);
        
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
        console.error('GET /api/empower/community-voices error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch community voices data'
        }, { status: 500 });
    }
}

// POST - Create new community voices data
export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'empower', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
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
        const communityVoicesData: EmpowerCommunityVoicesInsert = {
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
            }
        };

        const result = await db.insert(empowerCommunityVoices).values(communityVoicesData).returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/empower/community-voices error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create community voices data'
        }, { status: 500 });
    }
}

// PUT - Update existing community voices data
export async function PUT(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'empower', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        
        if (!body.id) {
            return NextResponse.json({
                success: false,
                error: 'ID is required for update'
            }, { status: 400 });
        }

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
            .where(eq(empowerCommunityVoices.id, body.id))
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
        console.error('PUT /api/empower/community-voices error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update community voices data'
        }, { status: 500 });
    }
}