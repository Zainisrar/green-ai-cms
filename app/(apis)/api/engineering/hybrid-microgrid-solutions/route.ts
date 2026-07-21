import { NextRequest, NextResponse } from 'next/server';
import { 
  getHybridMicrogrid, 
  createHybridMicrogrid, 
  updateHybridMicrogrid, 
  deleteHybridMicrogrid
} from '@/lib/api/engineeringHybridMicrogrid';
import { type EngineeringHybridMicrogridInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getHybridMicrogrid();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching hybrid microgrid solutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hybrid microgrid solutions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EngineeringHybridMicrogridInsert = await request.json();
    
    // Validate required fields
    if (!body.header || !body.header.title || !body.header.subtitle || !body.header.description) {
      return NextResponse.json(
        { error: 'Header with title, subtitle, and description is required' },
        { status: 400 }
      );
    }

    if (!body.solutions || !Array.isArray(body.solutions)) {
      return NextResponse.json(
        { error: 'Solutions array is required' },
        { status: 400 }
      );
    }

    // Validate solutions structure
    for (const solution of body.solutions) {
      if (!solution.id || !solution.heading || !Array.isArray(solution.points)) {
        return NextResponse.json(
          { error: 'Each solution must have id, heading, and points array' },
          { status: 400 }
        );
      }
    }

    if (!body.useCases || !body.useCases.heading || !Array.isArray(body.useCases.items)) {
      return NextResponse.json(
        { error: 'Use cases with heading and items array is required' },
        { status: 400 }
      );
    }

    if (!body.statement || !body.statement.text) {
      return NextResponse.json(
        { error: 'Statement with text is required' },
        { status: 400 }
      );
    }

    if (!body.quote || !body.quote.text) {
      return NextResponse.json(
        { error: 'Quote with text is required' },
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

    const data = await createHybridMicrogrid(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating hybrid microgrid solutions:', error);
    return NextResponse.json(
      { error: 'Failed to create hybrid microgrid solutions' },
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

    const data = await updateHybridMicrogrid(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating hybrid microgrid solutions:', error);
    return NextResponse.json(
      { error: 'Failed to update hybrid microgrid solutions' },
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

    await deleteHybridMicrogrid(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hybrid microgrid solutions:', error);
    return NextResponse.json(
      { error: 'Failed to delete hybrid microgrid solutions' },
      { status: 500 }
    );
  }
}