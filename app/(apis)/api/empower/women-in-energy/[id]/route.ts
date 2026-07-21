import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerWomenInEnergy, EmpowerWomenInEnergyInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific women in energy data by ID
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
            .from(empowerWomenInEnergy)
            .where(eq(empowerWomenInEnergy.id, id))
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Women in Energy data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/empower/women-in-energy/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch women in energy data'
        }, { status: 500 });
    }
}

// PUT - Update specific women in energy data by ID
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
        const womenInEnergyData: Partial<EmpowerWomenInEnergyInsert> = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', highlighted: '' },
                quote1: body.mainPage.quote1 || { text: '', highlighted: '' },
                quote2: body.mainPage.quote2 || { text: '', highlighted: '' },
                cta: Array.isArray(body.mainPage.cta) ? body.mainPage.cta : [],
            },
            modal: {
                whyThisMatters: body.modal.whyThisMatters || {
                    title: '',
                    subHeadline: '',
                    description: '',
                    img: { src: '', alt: '' },
                    keys: [],
                    quote: { text: '', highlighted: '' }
                },
                initiativesUnderway: body.modal.initiativesUnderway || {
                    title: '',
                    subHeadline: '',
                    key: [],
                    quote: { text: '', highlighted: '' }
                },
                voicesOfPower: body.modal.voicesOfPower || {
                    title: '',
                    items: []
                },
                partnerWithUs: body.modal.partnerWithUs || {
                    title: '',
                    description: '',
                    keys: [],
                    quote: { text: '', highlighted: '' },
                    img: { src: '', alt: '' }
                }
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(empowerWomenInEnergy)
            .set(womenInEnergyData)
            .where(eq(empowerWomenInEnergy.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Women in Energy data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/empower/women-in-energy/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update women in energy data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific women in energy data by ID
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
            .delete(empowerWomenInEnergy)
            .where(eq(empowerWomenInEnergy.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Women in Energy data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Women in Energy data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/empower/women-in-energy/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete women in energy data'
        }, { status: 500 });
    }
}