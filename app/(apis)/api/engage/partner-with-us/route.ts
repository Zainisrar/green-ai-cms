import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engagePartnerWithUs, EngagePartnerWithUsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch partner with us data
export async function GET() {
    try {
        const result = await db.select().from(engagePartnerWithUs).limit(1);
        
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
        console.error('GET /api/engage/partner-with-us error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch partner with us data'
        }, { status: 500 });
    }
}

// POST - Create new partner with us data
export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'edit');
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
        const partnerWithUsData: EngagePartnerWithUsInsert = {
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
            }
        };

        const result = await db.insert(engagePartnerWithUs).values(partnerWithUsData).returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/engage/partner-with-us error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create partner with us data'
        }, { status: 500 });
    }
}

// PUT - Update existing partner with us data
export async function PUT(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'edit');
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
            .where(eq(engagePartnerWithUs.id, body.id))
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
        console.error('PUT /api/engage/partner-with-us error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update partner with us data'
        }, { status: 500 });
    }
}