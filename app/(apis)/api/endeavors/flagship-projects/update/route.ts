import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { endeavorsFlagshipProjects } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
    try {
        // Use request headers to signal dynamic behavior
        const userAgent = request.headers.get('user-agent') || '';
        const timestamp = Date.now();

        const body = await request.json();
        const { title, subheadline, key, icons, description, footer, cta } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        if (!subheadline) {
            return NextResponse.json({ error: 'Subheadline is required' }, { status: 400 });
        }

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        if (!cta || !Array.isArray(cta) || cta.length === 0) {
            return NextResponse.json({ error: 'At least one CTA button is required' }, { status: 400 });
        }

        // Validate CTA buttons
        for (const ctaItem of cta) {
            if (!ctaItem.text || !ctaItem.href) {
                return NextResponse.json({ error: 'All CTA buttons must have text and href' }, { status: 400 });
            }
        }

        // Check if record exists
        console.log('Checking for existing records...');
        const existingProjects = await db.select().from(endeavorsFlagshipProjects).limit(1);
        console.log('Existing projects found:', existingProjects.length);

        if (existingProjects.length > 0) {
            console.log('Existing project:', {
                id: existingProjects[0].id,
                title: existingProjects[0].title,
                updatedAt: existingProjects[0].updatedAt,
            });
        }

        let result;
        if (existingProjects.length > 0) {
            console.log('Updating existing record with ID:', existingProjects[0].id);

            const updateData = {
                title,
                subheadline,
                key: key || { title: '', subtitle: '' },
                icons: icons || [],
                description,
                footer: footer || { title: '', subheadline: '' },
                cta,
                updatedAt: new Date(),
            };

            console.log('Update data:', JSON.stringify(updateData, null, 2));

            // Update existing record
            const updated = await db.update(endeavorsFlagshipProjects).set(updateData).where(eq(endeavorsFlagshipProjects.id, existingProjects[0].id)).returning();

            console.log('Update query executed, rows affected:', updated.length);
            console.log(
                'Updated record:',
                updated[0]
                    ? {
                          id: updated[0].id,
                          title: updated[0].title,
                          updatedAt: updated[0].updatedAt,
                      }
                    : 'No record returned',
            );

            result = updated[0];
        } else {
            console.log('Creating new record...');
            // Create new record
            const created = await db
                .insert(endeavorsFlagshipProjects)
                .values({
                    title,
                    subheadline,
                    key: key || { title: '', subtitle: '' },
                    icons: icons || [],
                    description,
                    footer: footer || { title: '', subheadline: '' },
                    cta,
                })
                .returning();
            console.log('Created new record:', created[0]);
            result = created[0];
        }

        // Verify the update by querying the database again
        console.log('Verifying update by re-querying database...');
        const verificationQuery = await db.select().from(endeavorsFlagshipProjects).limit(1);
        const verifiedRecord = verificationQuery[0];

        if (verifiedRecord) {
            console.log('Verification - Current record in DB:', {
                id: verifiedRecord.id,
                title: verifiedRecord.title,
                updatedAt: verifiedRecord.updatedAt,
            });
        } else {
            console.log('Verification - No record found in database!');
        }

        console.log('Update successful, returning result:', JSON.stringify(result, null, 2));

        const response = NextResponse.json(result);

        // Disable caching for PUT response
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error('Error updating flagship project:', error);
        return NextResponse.json({ error: 'Failed to update flagship project' }, { status: 500 });
    }
}
