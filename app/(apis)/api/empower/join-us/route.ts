import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerJoinUs, EmpowerJoinUsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

// GET - Fetch join-us data
export async function GET() {
    try {
        const result = await db.select().from(empowerJoinUs).limit(1);
        
        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Join Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('GET /api/empower/join-us error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch join-us data'
        }, { status: 500 });
    }
}

// POST - Create new join-us data
export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'empower', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        
        // Validate required fields
        const requiredFields = ['title', 'subHeadline', 'description', 'existingUsersCtaLink', 'newUsersCtaLink'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({
                    success: false,
                    error: `${field} is required`
                }, { status: 400 });
            }
        }

        // Ensure arrays are properly formatted
        const joinUsData: EmpowerJoinUsInsert = {
            title: body.title,
            subHeadline: body.subHeadline,
            description: body.description,
            existingUsersCtaLink: body.existingUsersCtaLink,
            newUsersCtaLink: body.newUsersCtaLink,
            quote: body.quote || { text: '', link: '' },
            cta: Array.isArray(body.cta) ? body.cta : [],
            keys: Array.isArray(body.keys) ? body.keys : [],
            dataPolicyEthics: body.dataPolicyEthics || { title: '', description: '' },
            email: body.email || { text: '', href: '' },
            phone: body.phone || { text: '', href: '' },
        };

        const result = await db.insert(empowerJoinUs).values(joinUsData).returning();

        return NextResponse.json({
            success: true,
            data: result[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/empower/join-us error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create join-us data'
        }, { status: 500 });
    }
}

// PUT - Update existing join-us data
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
        const requiredFields = ['title', 'subHeadline', 'description', 'existingUsersCtaLink', 'newUsersCtaLink'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({
                    success: false,
                    error: `${field} is required`
                }, { status: 400 });
            }
        }

        // Ensure arrays are properly formatted
        const joinUsData: Partial<EmpowerJoinUsInsert> = {
            title: body.title,
            subHeadline: body.subHeadline,
            description: body.description,
            existingUsersCtaLink: body.existingUsersCtaLink,
            newUsersCtaLink: body.newUsersCtaLink,
            quote: body.quote || { text: '', link: '' },
            cta: Array.isArray(body.cta) ? body.cta : [],
            keys: Array.isArray(body.keys) ? body.keys : [],
            dataPolicyEthics: body.dataPolicyEthics || { title: '', description: '' },
            email: body.email || { text: '', href: '' },
            phone: body.phone || { text: '', href: '' },
            updatedAt: new Date(),
        };

        const result = await db
            .update(empowerJoinUs)
            .set(joinUsData)
            .where(eq(empowerJoinUs.id, body.id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Join Us data not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('PUT /api/empower/join-us error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update join-us data'
        }, { status: 500 });
    }
}