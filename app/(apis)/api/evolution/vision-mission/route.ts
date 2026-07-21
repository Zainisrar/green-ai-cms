import { NextRequest, NextResponse } from 'next/server';
import { 
  getVisionMission, 
  createVisionMission, 
  updateVisionMission, 
  deleteVisionMission
} from '@/lib/api/evolutionVisionMission';
import { type EvolutionVisionMissionInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getVisionMission();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching vision mission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vision mission' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EvolutionVisionMissionInsert = await request.json();
    
    // Validate required fields
    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    // Validate sections structure
    for (const section of body.sections) {
      if (!section.id || !section.title || !section.blocks || !section.footer) {
        return NextResponse.json(
          { error: 'Each section must have id, title, blocks, and footer' },
          { status: 400 }
        );
      }

      // Validate blocks structure
      for (const block of section.blocks) {
        if (!block.title || !block.icon || !block.content) {
          return NextResponse.json(
            { error: 'Each block must have title, icon, and content' },
            { status: 400 }
          );
        }

        if (!block.icon.src || !block.icon.alt) {
          return NextResponse.json(
            { error: 'Block icon must have src and alt' },
            { status: 400 }
          );
        }

        if (!block.content.description || !block.content.quote) {
          return NextResponse.json(
            { error: 'Block content must have description and quote' },
            { status: 400 }
          );
        }
      }

      if (!section.footer.text) {
        return NextResponse.json(
          { error: 'Section footer must have text' },
          { status: 400 }
        );
      }
    }

    const data = await createVisionMission(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating vision mission:', error);
    return NextResponse.json(
      { error: 'Failed to create vision mission' },
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

    const data = await updateVisionMission(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating vision mission:', error);
    return NextResponse.json(
      { error: 'Failed to update vision mission' },
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

    await deleteVisionMission(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vision mission:', error);
    return NextResponse.json(
      { error: 'Failed to delete vision mission' },
      { status: 500 }
    );
  }
}