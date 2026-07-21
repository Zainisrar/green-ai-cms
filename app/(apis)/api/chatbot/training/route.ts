import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chatbotTraining } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const files = await db
      .select()
      .from(chatbotTraining)
      .orderBy(desc(chatbotTraining.createdAt));

    return NextResponse.json(files);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}