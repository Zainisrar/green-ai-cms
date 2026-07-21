import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { expertise } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve expertise entries; if ?id= or ?slug= is provided, return that item, otherwise return all
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    const slugParam = url.searchParams.get('slug');

    if (idParam) {
      const [item] = await db
        .select()
        .from(expertise)
        .where(eq(expertise.id, Number(idParam)))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Expertise entry not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    if (slugParam) {
      const [item] = await db
        .select()
        .from(expertise)
        .where(eq(expertise.slug, slugParam))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Expertise entry not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    const allEntries = await db.select().from(expertise);
    return NextResponse.json({ success: true, data: allEntries });
  } catch (error) {
    console.error('Error fetching expertise entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expertise entries' },
      { status: 500 }
    );
  }
}

// POST: Create a new expertise entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'title', 'subtitle', 'highlighted', 'description', 'image', 'slug',
      'highlightedTitle', 'subtitlePage', 'descriptionPage', 'icons', 'carousel', 'keys'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate arrays
    if (!Array.isArray(body.icons) || body.icons.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one icon is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.carousel) || body.carousel.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one carousel image is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.keys) || body.keys.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one key point is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!body.slug.startsWith('/expertise/')) {
      return NextResponse.json(
        { success: false, error: 'Slug must start with "/expertise/"' },
        { status: 400 }
      );
    }

    // Validate icon structure
    for (const icon of body.icons) {
      if (!icon.img || !icon.img.src || !icon.img.alt || !icon.title || !icon.description) {
        return NextResponse.json(
          { success: false, error: 'Each icon must have img.src, img.alt, title, and description' },
          { status: 400 }
        );
      }
    }

    // Validate carousel structure
    for (const item of body.carousel) {
      if (!item.img || !item.img.src || !item.img.alt) {
        return NextResponse.json(
          { success: false, error: 'Each carousel item must have img.src and img.alt' },
          { status: 400 }
        );
      }
    }

    const [newEntry] = await db
      .insert(expertise)
      .values({
        title: body.title,
        subtitle: body.subtitle,
        highlighted: body.highlighted,
        description: body.description,
        image: body.image,
        slug: body.slug,
        highlightedTitle: body.highlightedTitle,
        subtitlePage: body.subtitlePage,
        descriptionPage: body.descriptionPage,
        icons: body.icons,
        carousel: body.carousel,
        keys: body.keys,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: newEntry,
      message: 'Expertise entry created successfully' 
    });
  } catch (error) {
    console.error('Error creating expertise entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expertise entry' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing expertise entry
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

    // Check if expertise entry exists
    const [existingEntry] = await db
      .select()
      .from(expertise)
      .where(eq(expertise.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Expertise entry not found' },
        { status: 404 }
      );
    }

    // Update the expertise entry
    const [updatedEntry] = await db
      .update(expertise)
      .set({
        title: body.title,
        subtitle: body.subtitle,
        highlighted: body.highlighted,
        description: body.description,
        image: body.image,
        slug: body.slug,
        highlightedTitle: body.highlightedTitle,
        subtitlePage: body.subtitlePage,
        descriptionPage: body.descriptionPage,
        icons: body.icons,
        carousel: body.carousel,
        keys: body.keys,
        updatedAt: new Date(),
      })
      .where(eq(expertise.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: updatedEntry,
      message: 'Expertise entry updated successfully' 
    });
  } catch (error) {
    console.error('Error updating expertise entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expertise entry' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an expertise entry
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

    // Check if expertise entry exists
    const [existingEntry] = await db
      .select()
      .from(expertise)
      .where(eq(expertise.id, parseInt(id)))
      .limit(1);
      
    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Expertise entry not found' },
        { status: 404 }
      );
    }

    await db.delete(expertise).where(eq(expertise.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Expertise entry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting expertise entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete expertise entry' },
      { status: 500 }
    );
  }
}