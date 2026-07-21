import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exploreWhyGreen } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve explore why-green entries; if ?id= is provided, return that item, otherwise return all
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');

    if (idParam) {
      const [item] = await db
        .select()
        .from(exploreWhyGreen)
        .where(eq(exploreWhyGreen.id, Number(idParam)))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Why green entry not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    const allEntries = await db.select().from(exploreWhyGreen);
    return NextResponse.json({ success: true, data: allEntries });
  } catch (error) {
    console.error('Error fetching why green entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch why green entries' },
      { status: 500 }
    );
  }
}

// POST: Create a new why green entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['key', 'content', 'icons'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate key structure
    if (!body.key.text) {
      return NextResponse.json(
        { success: false, error: 'Key must have a text property' },
        { status: 400 }
      );
    }

    // Validate icons structure
    if (!Array.isArray(body.icons)) {
      return NextResponse.json(
        { success: false, error: 'Icons must be an array' },
        { status: 400 }
      );
    }

    for (const icon of body.icons) {
      if (!icon.text || !icon.img || !icon.img.src || !icon.img.alt || !icon.description) {
        return NextResponse.json(
          { success: false, error: 'Each icon must have text, img (with src and alt), and description' },
          { status: 400 }
        );
      }
    }

    // Content is HTML string, ensure it's a string
    if (body.content && typeof body.content !== 'string') {
      body.content = String(body.content);
    }

    const [newEntry] = await db
      .insert(exploreWhyGreen)
      .values({
        key: body.key,
        content: body.content,
        icons: body.icons,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: newEntry,
      message: 'Why green entry created successfully' 
    });
  } catch (error) {
    console.error('Error creating why green entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create why green entry' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing why green entry
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Content is HTML string, ensure it's a string if provided
    if (body.content && typeof body.content !== 'string') {
      body.content = String(body.content);
    }

    // Check if why green entry exists
    const [existingEntry] = await db
      .select()
      .from(exploreWhyGreen)
      .where(eq(exploreWhyGreen.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Why green entry not found' },
        { status: 404 }
      );
    }

    // Update the why green entry
    const [updatedEntry] = await db
      .update(exploreWhyGreen)
      .set({
        key: body.key || existingEntry.key,
        content: body.content || existingEntry.content,
        icons: body.icons || existingEntry.icons,
        updatedAt: new Date(),
      })
      .where(eq(exploreWhyGreen.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: updatedEntry,
      message: 'Why green entry updated successfully' 
    });
  } catch (error) {
    console.error('Error updating why green entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update why green entry' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a why green entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if why green entry exists
    const [existingEntry] = await db
      .select()
      .from(exploreWhyGreen)
      .where(eq(exploreWhyGreen.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Why green entry not found' },
        { status: 404 }
      );
    }

    await db.delete(exploreWhyGreen).where(eq(exploreWhyGreen.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Why green entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting why green entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete why green entry' },
      { status: 500 }
    );
  }
}