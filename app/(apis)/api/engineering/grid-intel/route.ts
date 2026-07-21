import { NextRequest, NextResponse } from 'next/server';
import { 
  getGridIntel, 
  createGridIntel, 
  updateGridIntel, 
  deleteGridIntel
} from '@/lib/api/engineeringGridIntel';
import { type EngineeringGridIntelInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getGridIntel();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Grid Intel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Grid Intel' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EngineeringGridIntelInsert = await request.json();
    
    // Validate required fields
    if (!body.mainPage || !body.mainPage.title || !body.mainPage.subtitle) {
      return NextResponse.json(
        { error: 'Main page with title and subtitle is required' },
        { status: 400 }
      );
    }

    if (!body.productIntegration || !body.productIntegration.title) {
      return NextResponse.json(
        { error: 'Product integration modal is required' },
        { status: 400 }
      );
    }

    if (!body.technologyStack || !body.technologyStack.title) {
      return NextResponse.json(
        { error: 'Technology stack modal is required' },
        { status: 400 }
      );
    }

    if (!body.scenarios || !body.scenarios.title) {
      return NextResponse.json(
        { error: 'Scenarios modal is required' },
        { status: 400 }
      );
    }

    if (!body.whyDifferent || !body.whyDifferent.title) {
      return NextResponse.json(
        { error: 'Why different modal is required' },
        { status: 400 }
      );
    }

    if (!body.whatSolves || !body.whatSolves.title) {
      return NextResponse.json(
        { error: 'What solves modal is required' },
        { status: 400 }
      );
    }

    if (!body.challenge || !body.challenge.title) {
      return NextResponse.json(
        { error: 'Challenge modal is required' },
        { status: 400 }
      );
    }

    const data = await createGridIntel(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating Grid Intel:', error);
    return NextResponse.json(
      { error: 'Failed to create Grid Intel' },
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

    const data = await updateGridIntel(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating Grid Intel:', error);
    return NextResponse.json(
      { error: 'Failed to update Grid Intel' },
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

    await deleteGridIntel(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Grid Intel:', error);
    return NextResponse.json(
      { error: 'Failed to delete Grid Intel' },
      { status: 500 }
    );
  }
}