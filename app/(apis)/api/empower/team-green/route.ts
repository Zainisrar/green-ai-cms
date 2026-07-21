import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerTeamGreen } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const teamGreenData = await db
            .select()
            .from(empowerTeamGreen)
            .orderBy(desc(empowerTeamGreen.updatedAt))
            .limit(1);

        return NextResponse.json({
            success: true,
            data: teamGreenData[0] || null
        });

    } catch (error) {
        console.error('Get team green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch team green data' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResult = await requirePermission(request, 'empower', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { mainPage, whoWeAreModal, ourLeadershipPhilosophy, meetTeam, ourCultureActionModal } = await request.json();

        if (!mainPage || !mainPage.title || !mainPage.subHeadline) {
            return NextResponse.json({ 
                success: false, 
                error: 'Main page with title and subHeadline are required' 
            }, { status: 400 });
        }

        const newTeamGreen = await db.insert(empowerTeamGreen).values({
            mainPage,
            whoWeAreModal,
            ourLeadershipPhilosophy,
            meetTeam,
            ourCultureActionModal
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Team green data created successfully',
            data: newTeamGreen[0]
        });

    } catch (error) {
        console.error('Create team green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create team green data' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const authResult = await requirePermission(request, 'empower', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id, mainPage, whoWeAreModal, ourLeadershipPhilosophy, meetTeam, ourCultureActionModal } = await request.json();

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
        if (whoWeAreModal) updateData.whoWeAreModal = whoWeAreModal;
        if (ourLeadershipPhilosophy) updateData.ourLeadershipPhilosophy = ourLeadershipPhilosophy;
        if (meetTeam) updateData.meetTeam = meetTeam;
        if (ourCultureActionModal) updateData.ourCultureActionModal = ourCultureActionModal;

        const updatedTeamGreen = await db
            .update(empowerTeamGreen)
            .set(updateData)
            .where(eq(empowerTeamGreen.id, parseInt(id)))
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Team green data updated successfully',
            data: updatedTeamGreen[0]
        });

    } catch (error) {
        console.error('Update team green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update team green data' 
        }, { status: 500 });
    }
}