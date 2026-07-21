import { NextRequest, NextResponse } from 'next/server';
import {
    getOurStoryMilestone,
    createOurStoryMilestone,
    updateOurStoryMilestone,
    deleteOurStoryMilestone,
    getOurStoryMilestoneByKey,
    updateOurStoryMilestoneByKey,
    deleteOurStoryMilestoneByKey,
} from '@/lib/api/evolutionOurStoryMilestone';
import { type EvolutionOurStoryMilestoneInsert } from '@/db/schema';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (key) {
            const data = await getOurStoryMilestoneByKey(key);
            return NextResponse.json(data);
        }

        const data = await getOurStoryMilestone();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching our story milestone:', error);
        return NextResponse.json({ error: 'Failed to fetch our story milestone' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: EvolutionOurStoryMilestoneInsert = await request.json();

        // Validate required fields
        if (!body.key || !body.title || !body.description || !body.ourMilestone) {
            return NextResponse.json({ error: 'Key, title, description, and ourMilestone are required' }, { status: 400 });
        }

        // Validate ourMilestone structure
        if (!body.ourMilestone.title || !body.ourMilestone.maps) {
            return NextResponse.json({ error: 'ourMilestone must have title and maps' }, { status: 400 });
        }

        // Validate maps structure
        if (!body.ourMilestone.maps.activeImg || !body.ourMilestone.maps.secondaryImg) {
            return NextResponse.json({ error: 'maps must have activeImg and secondaryImg' }, { status: 400 });
        }

        const data = await createOurStoryMilestone(body);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error creating our story milestone:', error);
        return NextResponse.json({ error: 'Failed to create our story milestone' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, key, ...updateData } = body;

        if (!id && !key) {
            return NextResponse.json({ error: 'ID or key is required for update' }, { status: 400 });
        }

        let data;
        if (key) {
            data = await updateOurStoryMilestoneByKey(key, updateData);
        } else {
            data = await updateOurStoryMilestone(id, updateData);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating our story milestone:', error);
        return NextResponse.json({ error: 'Failed to update our story milestone' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const key = searchParams.get('key');

        if (!id && !key) {
            return NextResponse.json({ error: 'ID or key is required for deletion' }, { status: 400 });
        }

        if (key) {
            await deleteOurStoryMilestoneByKey(key);
        } else {
            await deleteOurStoryMilestone(parseInt(id!));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting our story milestone:', error);
        return NextResponse.json({ error: 'Failed to delete our story milestone' }, { status: 500 });
    }
}
