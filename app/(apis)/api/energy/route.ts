import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { energy } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve energy entries; if ?id= is provided, return that item, otherwise return all
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');

    if (idParam) {
      const [item] = await db
        .select()
        .from(energy)
        .where(eq(energy.id, Number(idParam)))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Energy entry not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    const allEntries = await db.select().from(energy);
    return NextResponse.json({ success: true, data: allEntries });
  } catch (error) {
    console.error('Error fetching energy entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch energy entries' },
      { status: 500 }
    );
  }
}

// POST: Create a new energy entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['service1', 'service2', 'service3', 'service4', 'headline', 'subheadline', 'cta'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate service structure
    const serviceFields = ['service1', 'service2', 'service3', 'service4'];
    for (const field of serviceFields) {
      const service = body[field];
      if (!service.title || !service.description || !service.shortDescription || !Array.isArray(service.keys)) {
        return NextResponse.json(
          { success: false, error: `${field} must have title, description, shortDescription, and keys array` },
          { status: 400 }
        );
      }
    }

    // Validate CTA structure
    if (!body.cta.text || !body.cta.href) {
      return NextResponse.json(
        { success: false, error: 'CTA must have text and href properties' },
        { status: 400 }
      );
    }

    const [newEntry] = await db
      .insert(energy)
      .values({
        service1: body.service1,
        service2: body.service2,
        service3: body.service3,
        service4: body.service4,
        headline: body.headline,
        subheadline: body.subheadline,
        cta: body.cta,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: newEntry,
      message: 'Energy entry created successfully' 
    });
  } catch (error) {
    console.error('Error creating energy entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create energy entry' },
      { status: 500 }
    );
  }
}
 

//PUT: Update an existing energy entry
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

    // Check if energy entry exists
    const [existingEntry] = await db
      .select()
      .from(energy)
      .where(eq(energy.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Energy entry not found' },
        { status: 404 }
      );
    }

    // Update the energy entry
    const [updatedEntry] = await db
      .update(energy)
      .set({
        service1: body.service1,
        service2: body.service2,
        service3: body.service3,
        service4: body.service4,
        headline: body.headline,
        subheadline: body.subheadline,
        cta: body.cta,
        updatedAt: new Date(),
      })
      .where(eq(energy.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: updatedEntry,
      message: 'Energy entry updated successfully' 
    });
  } catch (error) {
    console.error('Error updating energy entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update energy entry' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an energy entry
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

    // Check if energy entry exists
    const [existingEntry] = await db
      .select()
      .from(energy)
      .where(eq(energy.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Energy entry not found' },
        { status: 404 }
      );
    }

    await db.delete(energy).where(eq(energy.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Energy entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting energy entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete energy entry' },
      { status: 500 }
    );
  }
}