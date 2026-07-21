import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageInvestorRelations, EngageInvestorRelationsInsert } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch investor relations data
export async function GET() {
    try {
        const result = await db
            .select()
            .from(engageInvestorRelations)
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Investor Relations data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/engage/investor-relations error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch investor relations data'
        }, { status: 500 });
    }
}

// POST - Create new investor relations data
export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();

        // Validate required fields
        if (!body.mainPage || !body.whyInvestGreen || !body.investmentInstruments || !body.investmentFocusArea || !body.performanceSnapshots) {
            return NextResponse.json({
                success: false,
                error: 'All sections are required'
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
        const existing = await db.select().from(engageInvestorRelations).limit(1);
        if (existing.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Investor Relations data already exists. Use PUT to update.'
            }, { status: 409 });
        }

        // Ensure arrays and objects are properly formatted
        const investorRelationsData: EngageInvestorRelationsInsert = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', highlighted: '' },
                quote1: body.mainPage.quote1 || { text: '', highlighted: '' },
                quote2: body.mainPage.quote2 || { text: '', highlighted: '' },
                cta: Array.isArray(body.mainPage.cta) ? body.mainPage.cta : [],
            },
            whyInvestGreen: {
                title: body.whyInvestGreen.title || '',
                headline: body.whyInvestGreen.headline || '',
                key: Array.isArray(body.whyInvestGreen.key) ? body.whyInvestGreen.key : [],
                quote: body.whyInvestGreen.quote || { text: '', highlighted: '' }
            },
            investmentInstruments: {
                title: body.investmentInstruments.title || '',
                headline: body.investmentInstruments.headline || '',
                key: Array.isArray(body.investmentInstruments.key) ? body.investmentInstruments.key : [],
                quote: body.investmentInstruments.quote || { text: '', highlighted: '' }
            },
            investmentFocusArea: {
                title: body.investmentFocusArea.title || '',
                headline: body.investmentFocusArea.headline || '',
                focusArea: { items: Array.isArray(body.investmentFocusArea.focusArea?.items) ? body.investmentFocusArea.focusArea.items : [] },
                capitalUse: { items: Array.isArray(body.investmentFocusArea.capitalUse?.items) ? body.investmentFocusArea.capitalUse.items : [] },
                returnProfile: { items: Array.isArray(body.investmentFocusArea.returnProfile?.items) ? body.investmentFocusArea.returnProfile.items : [] }
            },
            performanceSnapshots: {
                title: body.performanceSnapshots.title || '',
                headline: body.performanceSnapshots.headline || '',
                metric: { items: Array.isArray(body.performanceSnapshots.metric?.items) ? body.performanceSnapshots.metric.items : [] },
                value: { items: Array.isArray(body.performanceSnapshots.value?.items) ? body.performanceSnapshots.value.items : [] }
            }
        };

        const result = await db
            .insert(engageInvestorRelations)
            .values(investorRelationsData)
            .returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/engage/investor-relations error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create investor relations data'
        }, { status: 500 });
    }
}