import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { home } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve home entries; if ?id= or ?slug= is provided, return that item, otherwise return all
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    const slugParam = url.searchParams.get('slug');

    if (idParam) {
      const [item] = await db
        .select()
        .from(home)
        .where(eq(home.id, Number(idParam)))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Home entry not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    if (slugParam) {
      const [item] = await db
        .select()
        .from(home)
        .where(eq(home.slug, slugParam))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Home entry not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    const allEntries = await db.select().from(home);
    return NextResponse.json({ success: true, data: allEntries });
  } catch (error) {
    console.error('Error fetching home entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch home entries' },
      { status: 500 }
    );
  }
}

// POST: Create a new home entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['text1', 'text2', 'text3', 'text4', 'text5', 'slug'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate text sections structure
    const textFields = ['text1', 'text2', 'text3', 'text4', 'text5'];
    for (const field of textFields) {
      if (!body[field].headline) {
        return NextResponse.json(
          { success: false, error: `${field} must have a headline` },
          { status: 400 }
        );
      }
    }

    // Validate slug format
    if (!body.slug.startsWith('/home/')) {
      return NextResponse.json(
        { success: false, error: 'Slug must start with "/home/"' },
        { status: 400 }
      );
    }

    const [newEntry] = await db
      .insert(home)
      .values({
        text1: body.text1,
        text2: body.text2,
        text3: body.text3,
        text4: body.text4,
        text5: body.text5,
        slug: body.slug,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: newEntry,
      message: 'Home entry created successfully' 
    });
  } catch (error) {
    console.error('Error creating home entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create home entry' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing home entry
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

    // Check if home entry exists
    const [existingEntry] = await db
      .select()
      .from(home)
      .where(eq(home.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Home entry not found' },
        { status: 404 }
      );
    }

    // Update the home entry
    const [updatedEntry] = await db
      .update(home)
      .set({
        text1: body.text1,
        text2: body.text2,
        text3: body.text3,
        text4: body.text4,
        text5: body.text5,
        slug: body.slug,
        updatedAt: new Date(),
      })
      .where(eq(home.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: updatedEntry,
      message: 'Home entry updated successfully' 
    });
  } catch (error) {
    console.error('Error updating home entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update home entry' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a home entry
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

    // Check if home entry exists
    const [existingEntry] = await db
      .select()
      .from(home)
      .where(eq(home.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Home entry not found' },
        { status: 404 }
      );
    }

    await db.delete(home).where(eq(home.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Home entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting home entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete home entry' },
      { status: 500 }
    );
  }
}