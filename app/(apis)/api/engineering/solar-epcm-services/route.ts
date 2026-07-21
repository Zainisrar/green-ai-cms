import { NextRequest, NextResponse } from 'next/server';
import { 
  getSolarEPCM, 
  createSolarEPCM, 
  updateSolarEPCM, 
  deleteSolarEPCM
} from '@/lib/api/engineeringSolarEPCM';
import { type EngineeringSolarEPCMInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getSolarEPCM();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching solar EPCM services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solar EPCM services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EngineeringSolarEPCMInsert = await request.json();
    
    // Validate required fields
    if (!body.header || !body.header.title || !body.header.subtitle) {
      return NextResponse.json(
        { error: 'Header with title and subtitle is required' },
        { status: 400 }
      );
    }

    if (!body.introduction || !body.introduction.text) {
      return NextResponse.json(
        { error: 'Introduction with text is required' },
        { status: 400 }
      );
    }

    if (!body.services || !Array.isArray(body.services)) {
      return NextResponse.json(
        { error: 'Services array is required' },
        { status: 400 }
      );
    }

    // Validate services structure
    for (const service of body.services) {
      if (!service.id || !service.heading || !Array.isArray(service.points)) {
        return NextResponse.json(
          { error: 'Each service must have id, heading, and points array' },
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

    if (!body.tagline || !body.tagline.text) {
      return NextResponse.json(
        { error: 'Tagline with text is required' },
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

    const data = await createSolarEPCM(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating solar EPCM services:', error);
    return NextResponse.json(
      { error: 'Failed to create solar EPCM services' },
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

    const data = await updateSolarEPCM(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating solar EPCM services:', error);
    return NextResponse.json(
      { error: 'Failed to update solar EPCM services' },
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

    await deleteSolarEPCM(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting solar EPCM services:', error);
    return NextResponse.json(
      { error: 'Failed to delete solar EPCM services' },
      { status: 500 }
    );
  }
}