import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageBecomeSupplier, EngageBecomeSupplierInsert } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch become a supplier data
export async function GET() {
    try {
        const result = await db
            .select()
            .from(engageBecomeSupplier)
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
        console.error('GET /api/engage/become-a-supplier error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch become a supplier data'
        }, { status: 500 });
    }
}

// POST - Create new become a supplier data
export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'edit');
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

        // Check if data already exists (only one record allowed)
        const existing = await db.select().from(engageBecomeSupplier).limit(1);
        if (existing.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Become a Supplier data already exists. Use PUT to update.'
            }, { status: 409 });
        }

        // Ensure arrays and objects are properly formatted
        const becomeSupplierData: EngageBecomeSupplierInsert = {
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
        };

        const result = await db
            .insert(engageBecomeSupplier)
            .values(becomeSupplierData)
            .returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/engage/become-a-supplier error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create become a supplier data'
        }, { status: 500 });
    }
}