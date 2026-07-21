import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageMediaPress, EngageMediaPressInsert } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch media press data
export async function GET() {
    try {
        const result = await db
            .select()
            .from(engageMediaPress)
            .limit(1);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Media Press data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/engage/media-press error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch media press data'
        }, { status: 500 });
    }
}

// POST - Create new media press data
export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();

        // Validate required fields
        if (!body.mainPage || !body.latestPressReleases || !body.mediaContactRequests || !body.mediaKitDownload || !body.greenNews || !body.officialSpokesPeople) {
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
        const existing = await db.select().from(engageMediaPress).limit(1);
        if (existing.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Media Press data already exists. Use PUT to update.'
            }, { status: 409 });
        }

        // Ensure arrays and objects are properly formatted
        const mediaPressData: EngageMediaPressInsert = {
            mainPage: {
                title: body.mainPage.title,
                subHeadline: body.mainPage.subHeadline,
                description: body.mainPage.description || { text: '', highlighted: '' },
                quote: body.mainPage.quote || { text: '', highlighted: '' },
                cta: Array.isArray(body.mainPage.cta) ? body.mainPage.cta : [],
            },
            latestPressReleases: {
                title: body.latestPressReleases.title || '',
                items: Array.isArray(body.latestPressReleases.items) ? body.latestPressReleases.items : []
            },
            mediaContactRequests: {
                title: body.mediaContactRequests.title || '',
                contactType: Array.isArray(body.mediaContactRequests.contactType) ? body.mediaContactRequests.contactType : [],
                email: Array.isArray(body.mediaContactRequests.email) ? body.mediaContactRequests.email : [],
                phoneNumber: body.mediaContactRequests.phoneNumber || { src: '', text: '' },
                timings: body.mediaContactRequests.timings || ''
            },
            mediaKitDownload: {
                title: body.mediaKitDownload.title || '',
                kits: Array.isArray(body.mediaKitDownload.kits) ? body.mediaKitDownload.kits : []
            },
            greenNews: {
                title: body.greenNews.title || '',
                items: Array.isArray(body.greenNews.items) ? body.greenNews.items : []
            },
            officialSpokesPeople: {
                title: body.officialSpokesPeople.title || '',
                items: Array.isArray(body.officialSpokesPeople.items) ? body.officialSpokesPeople.items : []
            }
        };

        const result = await db
            .insert(engageMediaPress)
            .values(mediaPressData)
            .returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/engage/media-press error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create media press data'
        }, { status: 500 });
    }
}