import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { insights } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single insight
      const insight = await db.select().from(insights).where(eq(insights.id, parseInt(id))).limit(1);
      
      if (insight.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Insight not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: insight[0]
      });
    } else {
      // Get all insights
      const allInsights = await db.select().from(insights).orderBy(insights.createdAt);
      
      return NextResponse.json({
        success: true,
        data: allInsights
      });
    }
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newInsight = await db.insert(insights).values({
      headline: body.headline,
      subheadline: body.subheadline,
      highlighted: body.highlighted,
      description: body.description,
      bgImg: body.bgImg,
      keys: body.keys,
      cta1: body.cta1,
      cta2: body.cta2,
    }).returning();

    return NextResponse.json({
      success: true,
      data: newInsight[0]
    });
  } catch (error) {
    console.error('Error creating insight:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create insight' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const updatedInsight = await db.update(insights)
      .set({
        headline: body.headline,
        subheadline: body.subheadline,
        highlighted: body.highlighted,
        description: body.description,
        bgImg: body.bgImg,
        keys: body.keys,
        cta1: body.cta1,
        cta2: body.cta2,
        updatedAt: new Date(),
      })
      .where(eq(insights.id, parseInt(id)))
      .returning();

    if (updatedInsight.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Insight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedInsight[0]
    });
  } catch (error) {
    console.error('Error updating insight:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update insight' },
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
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    const deletedInsight = await db.delete(insights)
      .where(eq(insights.id, parseInt(id)))
      .returning();

    if (deletedInsight.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Insight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Insight deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting insight:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete insight' },
      { status: 500 }
    );
  }
}