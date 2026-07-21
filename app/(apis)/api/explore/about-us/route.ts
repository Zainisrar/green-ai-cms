import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exploreAboutUs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve explore about-us entries; if ?id= or ?key= is provided, return that item, otherwise return all
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const idParam = url.searchParams.get('id');
        const keyParam = url.searchParams.get('key');

        if (idParam) {
            const [item] = await db
                .select()
                .from(exploreAboutUs)
                .where(eq(exploreAboutUs.id, Number(idParam)))
                .limit(1);

            if (!item) {
                return NextResponse.json({ success: false, error: 'About us entry not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, data: item });
        }

        if (keyParam) {
            const [item] = await db.select().from(exploreAboutUs).where(eq(exploreAboutUs.key, keyParam)).limit(1);

            if (!item) {
                return NextResponse.json({ success: false, error: 'About us entry not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, data: item });
        }

        const allEntries = await db.select().from(exploreAboutUs);
        return NextResponse.json({ success: true, data: allEntries });
    } catch (error) {
        console.error('Error fetching about us entries:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch about us entries' }, { status: 500 });
    }
}

// POST: Create a new about us entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['title', 'key', 'content', 'quote', 'bgImg'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        // Content and quote are HTML strings, no need to validate as JSON
        // Just ensure they are strings if provided
        if (body.content && typeof body.content !== 'string') {
            body.content = String(body.content);
        }

        if (body.quote && typeof body.quote !== 'string') {
            body.quote = String(body.quote);
        }

        // Check if key already exists
        const [existingEntry] = await db.select().from(exploreAboutUs).where(eq(exploreAboutUs.key, body.key)).limit(1);

        if (existingEntry) {
            return NextResponse.json({ success: false, error: 'An entry with this key already exists' }, { status: 409 });
        }

        const [newEntry] = await db
            .insert(exploreAboutUs)
            .values({
                title: body.title,
                key: body.key,
                content: body.content,
                quote: body.quote,
                bgImg: body.bgImg,
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: newEntry,
            message: 'About us entry created successfully',
        });
    } catch (error) {
        console.error('Error creating about us entry:', error);
        return NextResponse.json({ success: false, error: 'Failed to create about us entry' }, { status: 500 });
    }
}
// PUT: Update an existing about us entry
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const key = searchParams.get('key');

        if (!id && !key) {
            return NextResponse.json({ success: false, error: 'ID or key is required' }, { status: 400 });
        }

        const body = await request.json();

        // Content and quote are HTML strings, no need to validate as JSON
        // Just ensure they are strings if provided
        if (body.content && typeof body.content !== 'string') {
            body.content = String(body.content);
        }

        if (body.quote && typeof body.quote !== 'string') {
            body.quote = String(body.quote);
        }

        // Find existing entry by id or key
        let whereCondition;
        if (id) {
            whereCondition = eq(exploreAboutUs.id, parseInt(id));
        } else {
            whereCondition = eq(exploreAboutUs.key, key!);
        }

        const [existingEntry] = await db.select().from(exploreAboutUs).where(whereCondition).limit(1);

        if (!existingEntry) {
            return NextResponse.json({ success: false, error: 'About us entry not found' }, { status: 404 });
        }

        // If updating key, check if new key already exists
        if (body.key && body.key !== existingEntry.key) {
            const [keyExists] = await db.select().from(exploreAboutUs).where(eq(exploreAboutUs.key, body.key)).limit(1);

            if (keyExists) {
                return NextResponse.json({ success: false, error: 'An entry with this key already exists' }, { status: 409 });
            }
        }

        // Update the about us entry
        const [updatedEntry] = await db
            .update(exploreAboutUs)
            .set({
                title: body.title || existingEntry.title,
                key: body.key || existingEntry.key,
                content: body.content || existingEntry.content,
                quote: body.quote || existingEntry.quote,
                bgImg: body.bgImg || existingEntry.bgImg,
                updatedAt: new Date(),
            })
            .where(whereCondition)
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedEntry,
            message: 'About us entry updated successfully',
        });
    } catch (error) {
        console.error('Error updating about us entry:', error);
        return NextResponse.json({ success: false, error: 'Failed to update about us entry' }, { status: 500 });
    }
}

// DELETE: Delete an about us entry
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const key = searchParams.get('key');

        if (!id && !key) {
            return NextResponse.json({ success: false, error: 'ID or key is required' }, { status: 400 });
        }

        // Find existing entry by id or key
        let whereCondition;
        if (id) {
            whereCondition = eq(exploreAboutUs.id, parseInt(id));
        } else {
            whereCondition = eq(exploreAboutUs.key, key!);
        }

        const [existingEntry] = await db.select().from(exploreAboutUs).where(whereCondition).limit(1);

        if (!existingEntry) {
            return NextResponse.json({ success: false, error: 'About us entry not found' }, { status: 404 });
        }

        await db.delete(exploreAboutUs).where(whereCondition);

        return NextResponse.json({
            success: true,
            message: 'About us entry deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting about us entry:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete about us entry' }, { status: 500 });
    }
}
