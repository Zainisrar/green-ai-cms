import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { engageNewsletterSignup } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePermission } from '@/lib/auth-middleware';

export async function GET() {
    try {
        const data = await db.select().from(engageNewsletterSignup).limit(1);
        
        if (data.length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'No newsletter signup data found' 
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
            error: 'Failed to fetch newsletter signup data' 
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
        const existingData = await db.select().from(engageNewsletterSignup).limit(1);
        if (existingData.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Newsletter signup data already exists. Use PUT to update.' 
            }, { status: 409 });
        }

        const newData = {
            title: body.title,
            subHeadline: body.subHeadline,
            description: body.description || { text: '', highlighted: '' },
            whySubscribe: body.whySubscribe || [],
            contact: body.contact || '',
            whatYouReceive: body.whatYouReceive || [],
            quote: body.quote || { text: '', highlighted: '' },
            cta: body.cta || [],
        };

        const result = await db.insert(engageNewsletterSignup).values(newData).returning();

        return NextResponse.json({ 
            success: true, 
            data: result[0] 
        }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create newsletter signup data' 
        }, { status: 500 });
    }
}