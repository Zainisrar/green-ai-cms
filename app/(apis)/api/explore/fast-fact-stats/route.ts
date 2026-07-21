import { NextRequest, NextResponse } from 'next/server';
import { 
  getFastFactStats, 
  createFastFactStats, 
  updateFastFactStats, 
  deleteFastFactStats 
} from '@/lib/api/exploreFastFactStats';
import { type ExploreFastFactStatsInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getFastFactStats();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fast fact stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fast fact stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExploreFastFactStatsInsert = await request.json();
    
    // Validate required fields
    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    const data = await createFastFactStats(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating fast fact stats:', error);
    return NextResponse.json(
      { error: 'Failed to create fast fact stats' },
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

    const data = await updateFastFactStats(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating fast fact stats:', error);
    return NextResponse.json(
      { error: 'Failed to update fast fact stats' },
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

    await deleteFastFactStats(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fast fact stats:', error);
    return NextResponse.json(
      { error: 'Failed to delete fast fact stats' },
      { status: 500 }
    );
  }
}