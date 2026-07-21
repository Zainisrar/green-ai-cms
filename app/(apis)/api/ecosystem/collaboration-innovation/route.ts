import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ecosystemCollaborationInnovation, EcosystemCollaborationInnovationInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(ecosystemCollaborationInnovation).orderBy(ecosystemCollaborationInnovation.createdAt).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ 
                error: 'No collaboration innovation data found' 
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

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body = await request.json();
        
        const insertData: EcosystemCollaborationInnovationInsert = {
            mainPage: body.mainPage,
            ourPhilosophy: body.ourPhilosophy,
            whoWeCelebrateWith: body.whoWeCelebrateWith,
            innovationSpotlight: body.innovationSpotlight,
        };

        const result = await db.insert(ecosystemCollaborationInnovation).values(insertData).returning();
        
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error creating collaboration innovation data:', error);
        return NextResponse.json({ 
            error: 'Failed to create collaboration innovation data' 
        }, { status: 500 });
    }
}