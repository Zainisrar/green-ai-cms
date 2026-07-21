import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerWomenInEnergy, EmpowerWomenInEnergyInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch women in energy data
export async function GET() {
    try {
        const result = await db.select().from(empowerWomenInEnergy).limit(1);
        
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
        console.error('GET /api/empower/women-in-energy error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch women in energy data'
        }, { status: 500 });
    }
}

// POST - Create new women in energy data
export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'empower', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
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
        const womenInEnergyData: EmpowerWomenInEnergyInsert = {
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
            }
        };

        const result = await db.insert(empowerWomenInEnergy).values(womenInEnergyData).returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/empower/women-in-energy error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create women in energy data'
        }, { status: 500 });
    }
}

// PUT - Update existing women in energy data
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
            .where(eq(empowerWomenInEnergy.id, body.id))
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
        console.error('PUT /api/empower/women-in-energy error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update women in energy data'
        }, { status: 500 });
    }
}