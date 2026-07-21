import { NextRequest, NextResponse } from 'next/server';
import { 
  getEnergyStorageSmartGrid, 
  createEnergyStorageSmartGrid, 
  updateEnergyStorageSmartGrid, 
  deleteEnergyStorageSmartGrid
} from '@/lib/api/engineeringEnergyStorageSmartGrid';
import { type EngineeringEnergyStorageSmartGridInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getEnergyStorageSmartGrid();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching energy storage smart grid:', error);
    return NextResponse.json(
      { error: 'Failed to fetch energy storage smart grid' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EngineeringEnergyStorageSmartGridInsert = await request.json();
    
    // Validate required fields
    if (!body.header || !body.header.title || !body.header.subtitle || !body.header.description) {
      return NextResponse.json(
        { error: 'Header with title, subtitle, and description is required' },
        { status: 400 }
      );
    }

    if (!body.architecture || !body.architecture.heading || !Array.isArray(body.architecture.items)) {
      return NextResponse.json(
        { error: 'Architecture with heading and items array is required' },
        { status: 400 }
      );
    }

    // Validate architecture items
    for (const item of body.architecture.items) {
      if (!item.title || !item.description) {
        return NextResponse.json(
          { error: 'Each architecture item must have title and description' },
          { status: 400 }
        );
      }
    }

    if (!body.quote || !body.quote.text) {
      return NextResponse.json(
        { error: 'Quote with text is required' },
        { status: 400 }
      );
    }

    if (!body.statement || !body.statement.heading || !body.statement.description) {
      return NextResponse.json(
        { error: 'Statement with heading and description is required' },
        { status: 400 }
      );
    }

    if (!body.callToActions || !Array.isArray(body.callToActions)) {
      return NextResponse.json(
        { error: 'Call to actions array is required' },
        { status: 400 }
      );
    }

    // Validate call to actions
    for (const cta of body.callToActions) {
      if (!cta.text) {
        return NextResponse.json(
          { error: 'Each call to action must have text' },
          { status: 400 }
        );
      }
      // href is optional
    }

    const data = await createEnergyStorageSmartGrid(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating energy storage smart grid:', error);
    return NextResponse.json(
      { error: 'Failed to create energy storage smart grid' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      );
    }

    const data = await updateEnergyStorageSmartGrid(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating energy storage smart grid:', error);
    return NextResponse.json(
      { error: 'Failed to update energy storage smart grid' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for deletion' },
        { status: 400 }
      );
    }

    await deleteEnergyStorageSmartGrid(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting energy storage smart grid:', error);
    return NextResponse.json(
      { error: 'Failed to delete energy storage smart grid' },
      { status: 500 }
    );
  }
}