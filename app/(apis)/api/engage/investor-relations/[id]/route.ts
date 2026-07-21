import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageInvestorRelations, EngageInvestorRelationsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific investor relations data by ID
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
            .from(engageInvestorRelations)
            .where(eq(engageInvestorRelations.id, id))
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
        console.error('GET /api/engage/investor-relations/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch investor relations data'
        }, { status: 500 });
    }
}

// PUT - Update specific investor relations data by ID
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

        // Ensure arrays and objects are properly formatted
        const investorRelationsData: Partial<EngageInvestorRelationsInsert> = {
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
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(engageInvestorRelations)
            .set(investorRelationsData)
            .where(eq(engageInvestorRelations.id, id))
            .returning();

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
        console.error('PUT /api/engage/investor-relations/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update investor relations data'
        }, { status: 500 });
    }
}

// PATCH - Partially update specific investor relations data by ID
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

        // Update only provided sections
        if (body.mainPage) {
            updateData.mainPage = body.mainPage;
        }

        if (body.whyInvestGreen) {
            updateData.whyInvestGreen = body.whyInvestGreen;
        }

        if (body.investmentInstruments) {
            updateData.investmentInstruments = body.investmentInstruments;
        }

        if (body.investmentFocusArea) {
            updateData.investmentFocusArea = body.investmentFocusArea;
        }

        if (body.performanceSnapshots) {
            updateData.performanceSnapshots = body.performanceSnapshots;
        }

        const result = await db
            .update(engageInvestorRelations)
            .set(updateData)
            .where(eq(engageInvestorRelations.id, id))
            .returning();

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
        console.error('PATCH /api/engage/investor-relations/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update investor relations data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific investor relations data by ID
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
            .delete(engageInvestorRelations)
            .where(eq(engageInvestorRelations.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Investor Relations data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Investor Relations data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/engage/investor-relations/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete investor relations data'
        }, { status: 500 });
    }
}