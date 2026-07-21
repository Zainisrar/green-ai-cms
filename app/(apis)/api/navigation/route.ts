import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { navigation } from '@/db/schema';
import { insertNavigationHierarchy, buildNavigationTree, type NavItem } from '@/db/navigation-utils';
import { eq } from 'drizzle-orm';

// Utility to recursively remove null fields, always exclude parentId, and exclude empty children arrays
function cleanAndRemoveParentId(obj: any): any {
  if (Array.isArray(obj)) {
    return obj
      .map(cleanAndRemoveParentId)
      .filter((item) => item && (typeof item !== 'object' || Object.keys(item).length > 0));
  } else if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (key === 'parentId') continue; // Never include parentId
      if (obj[key] === null || obj[key] === undefined) continue;
      if (key === 'children') {
        const cleanedChildren = cleanAndRemoveParentId(obj[key]);
        if (Array.isArray(cleanedChildren) && cleanedChildren.length > 0) {
          result[key] = cleanedChildren;
        }
      } else {
        result[key] = cleanAndRemoveParentId(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

// GET: Retrieve navigation; if ?id= is provided, return that item, otherwise return the hierarchical tree
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');

    if (idParam) {
      const [item] = await db
        .select()
        .from(navigation)
        .where(eq(navigation.id, Number(idParam)))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Navigation item not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    const flatItems = await db.select().from(navigation);
    const tree = buildNavigationTree(flatItems as any);
    const cleaned = cleanAndRemoveParentId(tree);
    return NextResponse.json({ success: true, data: cleaned });
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation' },
      { status: 500 }
    );
  }
}

// POST: Insert navigation items (handles hierarchical data)
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const replace = url.searchParams.get('replace') === 'true';
    const body = await request.json();
    
    // Handle single item creation
    if (!Array.isArray(body)) {
      const [createdItem] = await db
        .insert(navigation)
        .values(body)
        .returning();
        
      return NextResponse.json({ 
        success: true, 
        data: createdItem,
        message: 'Navigation item created successfully' 
      });
    }

    // Handle multiple items (hierarchical)
    const items: NavItem[] = body;

    if (replace) {
      // Clear existing navigation if ?replace=true
      await db.delete(navigation);
    }

    // Insert hierarchical navigation
    await insertNavigationHierarchy(db, items);

    return NextResponse.json({ 
      success: true, 
      message: `Navigation items ${replace ? 'replaced' : 'added'} successfully` 
    });
  } catch (error) {
    console.error('Error inserting navigation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to insert navigation' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a navigation item and its children
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

    // This will cascade delete children if you set up cascade in the schema
    await db.delete(navigation).where(eq(navigation.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Navigation item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting navigation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation' },
      { status: 500 }
    );
  }
}

// PUT: Update a navigation item by ID
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

    const [existingItem] = await db
      .select()
      .from(navigation)
      .where(eq(navigation.id, parseInt(id)))
      .limit(1);
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Navigation item not found' },
        { status: 404 }
      );
    }
    
    // Update and return the updated item
    const [updatedItem] = await db
      .update(navigation)
      .set({ ...body })
      .where(eq(navigation.id, parseInt(id)))
      .returning();
      
    return NextResponse.json({ 
      success: true, 
      data: updatedItem,
      message: 'Navigation item updated successfully' 
    });
  } catch (error) {
    console.error('Error updating navigation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update navigation' },
      { status: 500 }
    );
  }
}