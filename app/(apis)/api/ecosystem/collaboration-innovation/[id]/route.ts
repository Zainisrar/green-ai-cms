import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemCollaborationInnovation, EcosystemCollaborationInnovationInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const data = await db
            .select()
            .from(ecosystemCollaborationInnovation)
            .where(eq(ecosystemCollaborationInnovation.id, id))
            .limit(1);

        if (data.length === 0) {
            return NextResponse.json({ 
                error: 'Collaboration innovation data not found' 
            }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error fetching collaboration innovation data:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch collaboration innovation data' 
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const body = await request.json();
        
        const updateData: Partial<EcosystemCollaborationInnovationInsert> = {
            mainPage: body.mainPage,
            ourPhilosophy: body.ourPhilosophy,
            whoWeCelebrateWith: body.whoWeCelebrateWith,
            innovationSpotlight: body.innovationSpotlight,
        };

        const result = await db
            .update(ecosystemCollaborationInnovation)
            .set(updateData)
            .where(eq(ecosystemCollaborationInnovation.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ 
                error: 'Collaboration innovation data not found' 
            }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating collaboration innovation data:', error);
        return NextResponse.json({ 
            error: 'Failed to update collaboration innovation data' 
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ 
                error: 'Invalid ID format' 
            }, { status: 400 });
        }

        const result = await db
            .delete(ecosystemCollaborationInnovation)
            .where(eq(ecosystemCollaborationInnovation.id, id))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ 
                error: 'Collaboration innovation data not found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Collaboration innovation data deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting collaboration innovation data:', error);
        return NextResponse.json({ 
            error: 'Failed to delete collaboration innovation data' 
        }, { status: 500 });
    }
}