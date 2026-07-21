import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exploreGlobalSnapshot } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve explore global-snapshot entries; if ?id= is provided, return that item, otherwise return all
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');

    if (idParam) {
      const [item] = await db
        .select()
        .from(exploreGlobalSnapshot)
        .where(eq(exploreGlobalSnapshot.id, Number(idParam)))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Global snapshot entry not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    const allEntries = await db.select().from(exploreGlobalSnapshot);
    return NextResponse.json({ success: true, data: allEntries });
  } catch (error) {
    console.error('Error fetching global snapshot entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global snapshot entries' },
      { status: 500 }
    );
  }
}

// POST: Create a new global snapshot entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['sections'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate sections structure
    if (!Array.isArray(body.sections)) {
      return NextResponse.json(
        { success: false, error: 'Sections must be an array' },
        { status: 400 }
      );
    }

    // Basic validation for each section
    for (const section of body.sections) {
      if (!section.id || !section.type) {
        return NextResponse.json(
          { success: false, error: 'Each section must have id and type' },
          { status: 400 }
        );
      }
    }

    const [newEntry] = await db
      .insert(exploreGlobalSnapshot)
      .values({
        sections: body.sections,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: newEntry,
      message: 'Global snapshot entry created successfully' 
    });
  } catch (error) {
    console.error('Error creating global snapshot entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create global snapshot entry' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing global snapshot entry
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

    // Check if global snapshot entry exists
    const [existingEntry] = await db
      .select()
      .from(exploreGlobalSnapshot)
      .where(eq(exploreGlobalSnapshot.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Global snapshot entry not found' },
        { status: 404 }
      );
    }

    // Validate sections if provided
    if (body.sections && !Array.isArray(body.sections)) {
      return NextResponse.json(
        { success: false, error: 'Sections must be an array' },
        { status: 400 }
      );
    }

    // Update the global snapshot entry
    const [updatedEntry] = await db
      .update(exploreGlobalSnapshot)
      .set({
        sections: body.sections || existingEntry.sections,
        updatedAt: new Date(),
      })
      .where(eq(exploreGlobalSnapshot.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: updatedEntry,
      message: 'Global snapshot entry updated successfully' 
    });
  } catch (error) {
    console.error('Error updating global snapshot entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update global snapshot entry' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a global snapshot entry
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

    // Check if global snapshot entry exists
    const [existingEntry] = await db
      .select()
      .from(exploreGlobalSnapshot)
      .where(eq(exploreGlobalSnapshot.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Global snapshot entry not found' },
        { status: 404 }
      );
    }

    await db.delete(exploreGlobalSnapshot).where(eq(exploreGlobalSnapshot.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Global snapshot entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting global snapshot entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete global snapshot entry' },
      { status: 500 }
    );
  }
}