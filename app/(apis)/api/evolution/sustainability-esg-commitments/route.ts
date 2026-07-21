import { NextRequest, NextResponse } from 'next/server';
import { 
  getSustainabilityESG, 
  createSustainabilityESG, 
  updateSustainabilityESG, 
  deleteSustainabilityESG
} from '@/lib/api/evolutionSustainabilityESG';
import { type EvolutionSustainabilityESGInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getSustainabilityESG();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sustainability ESG:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sustainability ESG' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EvolutionSustainabilityESGInsert = await request.json();
    
    // Validate required fields
    if (!body.header || !body.header.title || !body.header.subtitle) {
      return NextResponse.json(
        { error: 'Header with title and subtitle is required' },
        { status: 400 }
      );
    }

    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    // Validate sections structure
    for (const section of body.sections) {
      if (!section.id || !section.heading || !section.icon || !Array.isArray(section.points)) {
        return NextResponse.json(
          { error: 'Each section must have id, heading, icon, and points array' },
          { status: 400 }
        );
      }

      if (!section.icon.src || !section.icon.alt) {
        return NextResponse.json(
          { error: 'Section icon must have src and alt' },
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

    if (!body.tagline) {
      return NextResponse.json(
        { error: 'Tagline is required' },
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
      // href is optional, no validation needed
    }

    const data = await createSustainabilityESG(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating sustainability ESG:', error);
    return NextResponse.json(
      { error: 'Failed to create sustainability ESG' },
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

    const data = await updateSustainabilityESG(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating sustainability ESG:', error);
    return NextResponse.json(
      { error: 'Failed to update sustainability ESG' },
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

    await deleteSustainabilityESG(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sustainability ESG:', error);
    return NextResponse.json(
      { error: 'Failed to delete sustainability ESG' },
      { status: 500 }
    );
  }
}