import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageMediaPress, EngageMediaPressInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch specific media press data by ID
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
            .from(engageMediaPress)
            .where(eq(engageMediaPress.id, id))
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
        console.error('GET /api/engage/media-press/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch media press data'
        }, { status: 500 });
    }
}

// PUT - Update specific media press data by ID
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

        // Ensure arrays and objects are properly formatted
        const mediaPressData: Partial<EngageMediaPressInsert> = {
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
            },
            updatedAt: new Date(),
        };

        const result = await db
            .update(engageMediaPress)
            .set(mediaPressData)
            .where(eq(engageMediaPress.id, id))
            .returning();

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
        console.error('PUT /api/engage/media-press/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update media press data'
        }, { status: 500 });
    }
}

// PATCH - Partially update specific media press data by ID
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

        if (body.latestPressReleases) {
            updateData.latestPressReleases = body.latestPressReleases;
        }

        if (body.mediaContactRequests) {
            updateData.mediaContactRequests = body.mediaContactRequests;
        }

        if (body.mediaKitDownload) {
            updateData.mediaKitDownload = body.mediaKitDownload;
        }

        if (body.greenNews) {
            updateData.greenNews = body.greenNews;
        }

        if (body.officialSpokesPeople) {
            updateData.officialSpokesPeople = body.officialSpokesPeople;
        }

        const result = await db
            .update(engageMediaPress)
            .set(updateData)
            .where(eq(engageMediaPress.id, id))
            .returning();

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
        console.error('PATCH /api/engage/media-press/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update media press data'
        }, { status: 500 });
    }
}

// DELETE - Delete specific media press data by ID
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
            .delete(engageMediaPress)
            .where(eq(engageMediaPress.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Media Press data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Media Press data deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/engage/media-press/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete media press data'
        }, { status: 500 });
    }
}