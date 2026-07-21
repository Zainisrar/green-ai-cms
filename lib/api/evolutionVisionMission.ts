import { db } from '@/db';
import { evolutionVisionMission, type EvolutionVisionMission, type EvolutionVisionMissionInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getVisionMission(): Promise<EvolutionVisionMission | null> {
  const result = await db.select().from(evolutionVisionMission).limit(1);
  return result[0] || null;
}

export async function getAllVisionMissions(): Promise<EvolutionVisionMission[]> {
  return await db.select().from(evolutionVisionMission);
}

export async function createVisionMission(data: EvolutionVisionMissionInsert): Promise<EvolutionVisionMission> {
  const result = await db.insert(evolutionVisionMission).values(data).returning();
  return result[0];
}

export async function updateVisionMission(id: number, data: Partial<EvolutionVisionMissionInsert>): Promise<EvolutionVisionMission> {
  const result = await db
    .update(evolutionVisionMission)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(evolutionVisionMission.id, id))
    .returning();
  return result[0];
}

export async function deleteVisionMission(id: number): Promise<void> {
  await db.delete(evolutionVisionMission).where(eq(evolutionVisionMission.id, id));
}

// API object for easier imports
export const evolutionVisionMissionApi = {
  get: getVisionMission,
  getAll: getAllVisionMissions,
  create: createVisionMission,
  update: updateVisionMission,
  delete: deleteVisionMission,
};

// Query keys for React Query
export const evolutionVisionMissionKeys = {
  all: ['evolution-vision-mission'] as const,
  lists: () => [...evolutionVisionMissionKeys.all, 'list'] as const,
  list: (filters: string) => [...evolutionVisionMissionKeys.lists(), { filters }] as const,
  details: () => [...evolutionVisionMissionKeys.all, 'detail'] as const,
  detail: (id: number) => [...evolutionVisionMissionKeys.details(), id] as const,
};