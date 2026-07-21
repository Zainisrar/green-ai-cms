import { db } from '@/db';
import { exploreFastFactStats, type ExploreFastFactStats, type ExploreFastFactStatsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getFastFactStats(): Promise<ExploreFastFactStats | null> {
  const result = await db.select().from(exploreFastFactStats).limit(1);
  return result[0] || null;
}

export async function createFastFactStats(data: ExploreFastFactStatsInsert): Promise<ExploreFastFactStats> {
  const result = await db.insert(exploreFastFactStats).values(data).returning();
  return result[0];
}

export async function updateFastFactStats(id: number, data: Partial<ExploreFastFactStatsInsert>): Promise<ExploreFastFactStats> {
  const result = await db
    .update(exploreFastFactStats)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exploreFastFactStats.id, id))
    .returning();
  return result[0];
}

export async function deleteFastFactStats(id: number): Promise<void> {
  await db.delete(exploreFastFactStats).where(eq(exploreFastFactStats.id, id));
}