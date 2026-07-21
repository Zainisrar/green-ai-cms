import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageRequestProposal } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(engageRequestProposal).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'No request proposal data found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            data: data[0] 
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch request proposal data' 
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication and permissions
        const authResult = await requirePermission(request, 'engage', 'edit');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        
        // Validate required fields
        if (!body.title || !body.subHeadline) {
            return NextResponse.json({ 
                success: false, 
                error: 'Title and sub-headline are required' 
            }, { status: 400 });
        }

        // Check if data already exists
        const existingData = await db.select().from(engageRequestProposal).limit(1);
        if (existingData.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Request proposal data already exists. Use PUT to update.' 
            }, { status: 409 });
        }

        const newData = {
            title: body.title,
            subHeadline: body.subHeadline,
            description: body.description || { text: '', highlighted: '' },
            whoShouldUseThis: body.whoShouldUseThis || { title: '', items: [] },
            whatGreenDeliversProposal: body.whatGreenDeliversProposal || [],
            email: body.email || { text: '', href: '' },
            quote: body.quote || { text: '', highlighted: '' },
            cta: body.cta || [],
        };

        const result = await db.insert(engageRequestProposal).values(newData).returning();

        return NextResponse.json({ 
            success: true, 
            data: result[0] 
        }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create request proposal data' 
        }, { status: 500 });
    }
}