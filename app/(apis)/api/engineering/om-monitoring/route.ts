import { NextRequest, NextResponse } from 'next/server';
import { 
  getOMMonitoring, 
  createOMMonitoring, 
  updateOMMonitoring, 
  deleteOMMonitoring
} from '@/lib/api/engineeringOMMonitoring';
import { type EngineeringOMMonitoringInsert } from '@/db/schema';

export async function GET() {
  try {
    const data = await getOMMonitoring();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching O&M monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to fetch O&M monitoring' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EngineeringOMMonitoringInsert = await request.json();
    
    // Validate required fields
    if (!body.header || !body.header.title || !body.header.subtitle || !body.header.description) {
      return NextResponse.json(
        { error: 'Header with title, subtitle, and description is required' },
        { status: 400 }
      );
    }

    if (!body.philosophy || !body.philosophy.heading || !Array.isArray(body.philosophy.items)) {
      return NextResponse.json(
        { error: 'Philosophy with heading and items array is required' },
        { status: 400 }
      );
    }

    // Validate philosophy items
    for (const item of body.philosophy.items) {
      if (!item.title || !item.description) {
        return NextResponse.json(
          { error: 'Each philosophy item must have title and description' },
          { status: 400 }
        );
      }
    }

    if (!body.whyMatters || !body.whyMatters.heading || !Array.isArray(body.whyMatters.points)) {
      return NextResponse.json(
        { error: 'Why matters with heading and points array is required' },
        { status: 400 }
      );
    }

    if (!body.services || !Array.isArray(body.services.items)) {
      return NextResponse.json(
        { error: 'Services with items array is required' },
        { status: 400 }
      );
    }

    // Validate service items
    for (const item of body.services.items) {
      if (!item.title || !item.description) {
        return NextResponse.json(
          { error: 'Each service item must have title and description' },
          { status: 400 }
        );
      }
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

    const data = await createOMMonitoring(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating O&M monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to create O&M monitoring' },
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

    const data = await updateOMMonitoring(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating O&M monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to update O&M monitoring' },
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

    await deleteOMMonitoring(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting O&M monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to delete O&M monitoring' },
      { status: 500 }
    );
  }
}