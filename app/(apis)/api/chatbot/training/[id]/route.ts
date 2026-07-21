import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatbotTraining } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Get the file record first
    const [file] = await db
      .select()
      .from(chatbotTraining)
      .where(eq(chatbotTraining.id, id));

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the physical file
    const fullPath = join(process.cwd(), 'public', file.filePath);
    if (existsSync(fullPath)) {
      try {
        await unlink(fullPath);
      } catch (error) {
        console.error('Failed to delete physical file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await db
      .delete(chatbotTraining)
      .where(eq(chatbotTraining.id, id));

    return NextResponse.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}