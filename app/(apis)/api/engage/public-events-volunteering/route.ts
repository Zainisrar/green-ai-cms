import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engagePublicEventsVolunteering, EngagePublicEventsVolunteeringInsert } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch public events volunteering data
export async function GET() {
    try {
        const result = await db
            .select()
            .from(engagePublicEventsVolunteering)
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
        console.error('GET /api/engage/public-events-volunteering error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch public events volunteering data'
        }, { status: 500 });
    }
}

// POST - Create new public events volunteering data
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
        const existing = await db.select().from(engagePublicEventsVolunteering).limit(1);
        if (existing.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Public Events Volunteering data already exists. Use PUT to update.'
            }, { status: 409 });
        }

        // Ensure arrays and objects are properly formatted
        const publicEventsVolunteeringData: EngagePublicEventsVolunteeringInsert = {
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
            }
        };

        const result = await db
            .insert(engagePublicEventsVolunteering)
            .values(publicEventsVolunteeringData)
            .returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/engage/public-events-volunteering error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create public events volunteering data'
        }, { status: 500 });
    }
}