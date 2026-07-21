import { db } from '@/db';
import { evolutionLeadershipTeam, type EvolutionLeadershipTeam, type EvolutionLeadershipTeamInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getLeadershipTeam(): Promise<EvolutionLeadershipTeam | null> {
  const result = await db.select().from(evolutionLeadershipTeam).limit(1);
  return result[0] || null;
}

export async function getAllLeadershipTeams(): Promise<EvolutionLeadershipTeam[]> {
  return await db.select().from(evolutionLeadershipTeam);
}

export async function createLeadershipTeam(data: EvolutionLeadershipTeamInsert): Promise<EvolutionLeadershipTeam> {
  const result = await db.insert(evolutionLeadershipTeam).values(data).returning();
  return result[0];
}

export async function updateLeadershipTeam(id: number, data: Partial<EvolutionLeadershipTeamInsert>): Promise<EvolutionLeadershipTeam> {
  const result = await db
    .update(evolutionLeadershipTeam)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(evolutionLeadershipTeam.id, id))
    .returning();
  return result[0];
}

export async function deleteLeadershipTeam(id: number): Promise<void> {
  await db.delete(evolutionLeadershipTeam).where(eq(evolutionLeadershipTeam.id, id));
}

// API object for easier imports
export const evolutionLeadershipTeamApi = {
  get: getLeadershipTeam,
  getAll: getAllLeadershipTeams,
  create: createLeadershipTeam,
  update: updateLeadershipTeam,
  delete: deleteLeadershipTeam,
};

// Query keys for React Query
export const evolutionLeadershipTeamKeys = {
  all: ['evolution-leadership-team'] as const,
  lists: () => [...evolutionLeadershipTeamKeys.all, 'list'] as const,
  list: (filters: string) => [...evolutionLeadershipTeamKeys.lists(), { filters }] as const,
  details: () => [...evolutionLeadershipTeamKeys.all, 'detail'] as const,
  detail: (id: number) => [...evolutionLeadershipTeamKeys.details(), id] as const,
};