import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerCareersAtGreen } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const careersData = await db
            .select()
            .from(empowerCareersAtGreen)
            .orderBy(desc(empowerCareersAtGreen.updatedAt))
            .limit(1);

        return NextResponse.json({
            success: true,
            data: careersData[0] || null
        });

    } catch (error) {
        console.error('Get careers at green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch careers at green data' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requirePermission(request, 'empower', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { mainPage, whyWorkWithGreenModal, careerTrackSupport, whatMakesGreenDifferent, openRoles } = await request.json();

        if (!mainPage || !mainPage.title || !mainPage.subHeadline) {
            return NextResponse.json({ 
                success: false, 
                error: 'Main page with title and subHeadline are required' 
            }, { status: 400 });
        }

        const newCareers = await db.insert(empowerCareersAtGreen).values({
            mainPage,
            whyWorkWithGreenModal,
            careerTrackSupport,
            whatMakesGreenDifferent,
            openRoles
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Careers at green data created successfully',
            data: newCareers[0]
        });

    } catch (error) {
        console.error('Create careers at green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create careers at green data' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const authResult = await requirePermission(request, 'empower', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id, mainPage, whyWorkWithGreenModal, careerTrackSupport, whatMakesGreenDifferent, openRoles } = await request.json();

        if (!id) {
            return NextResponse.json({ 
                success: false, 
                error: 'ID is required for update' 
            }, { status: 400 });
        }

        const updateData: any = {
            updatedAt: new Date()
        };

        if (mainPage) updateData.mainPage = mainPage;
        if (whyWorkWithGreenModal) updateData.whyWorkWithGreenModal = whyWorkWithGreenModal;
        if (careerTrackSupport) updateData.careerTrackSupport = careerTrackSupport;
        if (whatMakesGreenDifferent) updateData.whatMakesGreenDifferent = whatMakesGreenDifferent;
        if (openRoles) updateData.openRoles = openRoles;

        const updatedCareers = await db
            .update(empowerCareersAtGreen)
            .set(updateData)
            .where(eq(empowerCareersAtGreen.id, parseInt(id)))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Careers at green data updated successfully',
            data: updatedCareers[0]
        });

    } catch (error) {
        console.error('Update careers at green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update careers at green data' 
        }, { status: 500 });
    }
}