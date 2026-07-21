import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { insightDetails } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve insight details; if ?id= is provided, return that item, otherwise return all
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');

    if (idParam) {
      const [item] = await db
        .select()
        .from(insightDetails)
        .where(eq(insightDetails.id, Number(idParam)))
        .limit(1);

      if (!item) {
        return NextResponse.json({ success: false, error: 'Insight detail not found' }, { status: 404 });
      }

      // Map database fields to API format
      const mappedItem = {
        id: item.id,
        bgImg: item.bgImg,
        backgroundImg: item.backgroundImg,
        navigation: item.nav,
        title: item.title,
        subheadline: item.sub,
        description: item.desc,
        name1: item.name1,
        name2: item.name2,
        cardTitle: item.cardTitle,
        keypoints: item.keys,
        slug: item.slug,
        imageDirection: item.imageDirection,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };

      return NextResponse.json({ success: true, data: mappedItem });
    }

    const allDetails = await db.select().from(insightDetails);
    
    // Map all items to API format
    const mappedDetails = allDetails.map(item => ({
      id: item.id,
      bgImg: item.bgImg,
      backgroundImg: item.backgroundImg,
      navigation: item.nav,
      title: item.title,
      subheadline: item.sub,
      description: item.desc,
      name1: item.name1,
      name2: item.name2,
      cardTitle: item.cardTitle,
      keypoints: item.keys,
      slug: item.slug,
      imageDirection: item.imageDirection,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
    
    return NextResponse.json({ success: true, data: mappedDetails });
  } catch (error) {
    console.error('Error fetching insight details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insight details' },
      { status: 500 }
    );
  }
}

// POST: Create a new insight detail
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['bgImg', 'navigation', 'title', 'subheadline', 'description', 'name1', 'name2', 'cardTitle', 'keypoints'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate navigation structure
    if (!body.navigation.items || !Array.isArray(body.navigation.items)) {
      return NextResponse.json(
        { success: false, error: 'Navigation must have items array' },
        { status: 400 }
      );
    }

    // Validate keypoints array
    if (!Array.isArray(body.keypoints) || body.keypoints.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keypoints must be a non-empty array' },
        { status: 400 }
      );
    }

    const [newDetail] = await db
      .insert(insightDetails)
      .values({
        bgImg: body.bgImg,
        backgroundImg: body.backgroundImg,
        nav: body.navigation,
        title: body.title,
        sub: body.subheadline,
        desc: body.description,
        name1: body.name1,
        name2: body.name2,
        cardTitle: body.cardTitle,
        keys: body.keypoints,
        slug: body.slug || null,
        imageDirection: body.imageDirection || 'left',
      })
      .returning();

    // Map response to API format
    const mappedResponse = {
      id: newDetail.id,
      bgImg: newDetail.bgImg,
      backgroundImg: newDetail.backgroundImg,
      navigation: newDetail.nav,
      title: newDetail.title,
      subheadline: newDetail.sub,
      description: newDetail.desc,
      name1: newDetail.name1,
      name2: newDetail.name2,
      cardTitle: newDetail.cardTitle,
      keypoints: newDetail.keys,
      slug: newDetail.slug,
      imageDirection: newDetail.imageDirection,
      createdAt: newDetail.createdAt,
      updatedAt: newDetail.updatedAt,
    };

    return NextResponse.json({ 
      success: true, 
      data: mappedResponse,
      message: 'Insight detail created successfully' 
    });
  } catch (error) {
    console.error('Error creating insight detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create insight detail' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing insight detail
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

    // Check if insight detail exists
    const [existingDetail] = await db
      .select()
      .from(insightDetails)
      .where(eq(insightDetails.id, parseInt(id)))
      .limit(1);
      
    if (!existingDetail) {
      return NextResponse.json(
        { success: false, error: 'Insight detail not found' },
        { status: 404 }
      );
    }

    // Update the insight detail
    const [updatedDetail] = await db
      .update(insightDetails)
      .set({
        bgImg: body.bgImg,
        backgroundImg: body.backgroundImg,
        nav: body.navigation,
        title: body.title,
        sub: body.subheadline,
        desc: body.description,
        name1: body.name1,
        name2: body.name2,
        cardTitle: body.cardTitle,
        keys: body.keypoints,
        slug: body.slug || null,
        imageDirection: body.imageDirection || 'left',
        updatedAt: new Date(),
      })
      .where(eq(insightDetails.id, parseInt(id)))
      .returning();

    // Map response to API format
    const mappedResponse = {
      id: updatedDetail.id,
      bgImg: updatedDetail.bgImg,
      backgroundImg: updatedDetail.backgroundImg,
      navigation: updatedDetail.nav,
      title: updatedDetail.title,
      subheadline: updatedDetail.sub,
      description: updatedDetail.desc,
      name1: updatedDetail.name1,
      name2: updatedDetail.name2,
      cardTitle: updatedDetail.cardTitle,
      keypoints: updatedDetail.keys,
      slug: updatedDetail.slug,
      imageDirection: updatedDetail.imageDirection,
      createdAt: updatedDetail.createdAt,
      updatedAt: updatedDetail.updatedAt,
    };

    return NextResponse.json({ 
      success: true, 
      data: mappedResponse,
      message: 'Insight detail updated successfully' 
    });
  } catch (error) {
    console.error('Error updating insight detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update insight detail' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an insight detail
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

    // Check if insight detail exists
    const [existingDetail] = await db
      .select()
      .from(insightDetails)
      .where(eq(insightDetails.id, parseInt(id)))
      .limit(1);
      
    if (!existingDetail) {
      return NextResponse.json(
        { success: false, error: 'Insight detail not found' },
        { status: 404 }
      );
    }

    await db.delete(insightDetails).where(eq(insightDetails.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Insight detail deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting insight detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete insight detail' },
      { status: 500 }
    );
  }
}