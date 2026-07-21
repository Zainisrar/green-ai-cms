import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { empowerTeamGreen } from '@/db/schema';
import { requirePermission } from '@/lib/auth-middleware';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const teamGreenId = parseInt(params.id);
        
        const teamGreen = await db
            .select()
            .from(empowerTeamGreen)
            .where(eq(empowerTeamGreen.id, teamGreenId))
            .limit(1);

        if (!teamGreen[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Team green data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: teamGreen[0]
        });

    } catch (error) {
        console.error('Get team green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch team green data' 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requirePermission(request, 'empower', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const teamGreenId = parseInt(params.id);
        const { mainPage, whoWeAreModal, ourLeadershipPhilosophy, meetTeam, ourCultureActionModal } = await request.json();

        // Check if team green data exists
        const existingTeamGreen = await db.select().from(empowerTeamGreen).where(eq(empowerTeamGreen.id, teamGreenId)).limit(1);
        if (!existingTeamGreen[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Team green data not found' 
            }, { status: 404 });
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (mainPage) updateData.mainPage = mainPage;
        if (whoWeAreModal) updateData.whoWeAreModal = whoWeAreModal;
        if (ourLeadershipPhilosophy) updateData.ourLeadershipPhilosophy = ourLeadershipPhilosophy;
        if (meetTeam) updateData.meetTeam = meetTeam;
        if (ourCultureActionModal) updateData.ourCultureActionModal = ourCultureActionModal;

        // Update team green data
        const updatedTeamGreen = await db
            .update(empowerTeamGreen)
            .set(updateData)
            .where(eq(empowerTeamGreen.id, teamGreenId))
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authResult = await requirePermission(request, 'empower', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    try {
        const teamGreenId = parseInt(params.id);

        // Check if team green data exists
        const existingTeamGreen = await db.select().from(empowerTeamGreen).where(eq(empowerTeamGreen.id, teamGreenId)).limit(1);
        if (!existingTeamGreen[0]) {
            return NextResponse.json({ 
                success: false, 
                error: 'Team green data not found' 
            }, { status: 404 });
        }

        // Delete team green data
        await db.delete(empowerTeamGreen).where(eq(empowerTeamGreen.id, teamGreenId));

        return NextResponse.json({
            success: true,
            message: 'Team green data deleted successfully'
        });

    } catch (error) {
        console.error('Delete team green error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete team green data' 
        }, { status: 500 });
    }
}