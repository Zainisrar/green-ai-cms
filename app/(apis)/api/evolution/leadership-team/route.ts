import { NextRequest, NextResponse } from 'next/server';
import { 
  getLeadershipTeam, 
  createLeadershipTeam, 
  updateLeadershipTeam, 
  deleteLeadershipTeam
} from '@/lib/api/evolutionLeadershipTeam';
import { type EvolutionLeadershipTeamInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getLeadershipTeam();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching leadership team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leadership team' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EvolutionLeadershipTeamInsert = await request.json();
    
    // Validate required fields
    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    // Validate sections structure
    for (const section of body.sections) {
      if (!section.id || !section.title || !section.members) {
        return NextResponse.json(
          { error: 'Each section must have id, title, and members' },
          { status: 400 }
        );
      }

      // Validate members structure
      for (const member of section.members) {
        if (!member.name || !member.designation || !member.img) {
          return NextResponse.json(
            { error: 'Each member must have name, designation, and img' },
            { status: 400 }
          );
        }

        if (!member.img.src || !member.img.alt) {
          return NextResponse.json(
            { error: 'Member img must have src and alt' },
            { status: 400 }
          );
        }
      }
    }

    const data = await createLeadershipTeam(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating leadership team:', error);
    return NextResponse.json(
      { error: 'Failed to create leadership team' },
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

    const data = await updateLeadershipTeam(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating leadership team:', error);
    return NextResponse.json(
      { error: 'Failed to update leadership team' },
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

    await deleteLeadershipTeam(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting leadership team:', error);
    return NextResponse.json(
      { error: 'Failed to delete leadership team' },
      { status: 500 }
    );
  }
}