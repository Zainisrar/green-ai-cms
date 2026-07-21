import { db } from '@/db';
import { evolutionOurStoryMilestone, type EvolutionOurStoryMilestone, type EvolutionOurStoryMilestoneInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getOurStoryMilestone(): Promise<EvolutionOurStoryMilestone | null> {
  const result = await db.select().from(evolutionOurStoryMilestone).limit(1);
  return result[0] || null;
}

export async function getOurStoryMilestoneByKey(key: string): Promise<EvolutionOurStoryMilestone | null> {
  const result = await db.select().from(evolutionOurStoryMilestone).where(eq(evolutionOurStoryMilestone.key, key)).limit(1);
  return result[0] || null;
}

export async function getAllOurStoryMilestones(): Promise<EvolutionOurStoryMilestone[]> {
  return await db.select().from(evolutionOurStoryMilestone);
}

export async function createOurStoryMilestone(data: EvolutionOurStoryMilestoneInsert): Promise<EvolutionOurStoryMilestone> {
  const result = await db.insert(evolutionOurStoryMilestone).values(data).returning();
  return result[0];
}

export async function updateOurStoryMilestone(id: number, data: Partial<EvolutionOurStoryMilestoneInsert>): Promise<EvolutionOurStoryMilestone> {
  const result = await db
    .update(evolutionOurStoryMilestone)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(evolutionOurStoryMilestone.id, id))
    .returning();
  return result[0];
}

export async function updateOurStoryMilestoneByKey(key: string, data: Partial<EvolutionOurStoryMilestoneInsert>): Promise<EvolutionOurStoryMilestone> {
  const result = await db
    .update(evolutionOurStoryMilestone)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(evolutionOurStoryMilestone.key, key))
    .returning();
  return result[0];
}

export async function deleteOurStoryMilestone(id: number): Promise<void> {
  await db.delete(evolutionOurStoryMilestone).where(eq(evolutionOurStoryMilestone.id, id));
}

export async function deleteOurStoryMilestoneByKey(key: string): Promise<void> {
  await db.delete(evolutionOurStoryMilestone).where(eq(evolutionOurStoryMilestone.key, key));
}

// API object for easier imports
export const evolutionOurStoryMilestoneApi = {
  get: getOurStoryMilestone,
  getByKey: getOurStoryMilestoneByKey,
  getAll: getAllOurStoryMilestones,
  create: createOurStoryMilestone,
  update: updateOurStoryMilestone,
  updateByKey: updateOurStoryMilestoneByKey,
  delete: deleteOurStoryMilestone,
  deleteByKey: deleteOurStoryMilestoneByKey,
};

// Query keys for React Query
export const evolutionOurStoryMilestoneKeys = {
  all: ['evolution-our-story-milestone'] as const,
  lists: () => [...evolutionOurStoryMilestoneKeys.all, 'list'] as const,
  list: (filters: string) => [...evolutionOurStoryMilestoneKeys.lists(), { filters }] as const,
  details: () => [...evolutionOurStoryMilestoneKeys.all, 'detail'] as const,
  detail: (id: number) => [...evolutionOurStoryMilestoneKeys.details(), id] as const,
  byKey: (key: string) => [...evolutionOurStoryMilestoneKeys.all, 'key', key] as const,
};