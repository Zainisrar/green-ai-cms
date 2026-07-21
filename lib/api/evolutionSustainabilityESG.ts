import { db } from '@/db';
import { evolutionSustainabilityESG, type EvolutionSustainabilityESG, type EvolutionSustainabilityESGInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getSustainabilityESG(): Promise<EvolutionSustainabilityESG | null> {
  const result = await db.select().from(evolutionSustainabilityESG).limit(1);
  return result[0] || null;
}

export async function getAllSustainabilityESG(): Promise<EvolutionSustainabilityESG[]> {
  return await db.select().from(evolutionSustainabilityESG);
}

export async function createSustainabilityESG(data: EvolutionSustainabilityESGInsert): Promise<EvolutionSustainabilityESG> {
  const result = await db.insert(evolutionSustainabilityESG).values(data).returning();
  return result[0];
}

export async function updateSustainabilityESG(id: number, data: Partial<EvolutionSustainabilityESGInsert>): Promise<EvolutionSustainabilityESG> {
  const result = await db
    .update(evolutionSustainabilityESG)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(evolutionSustainabilityESG.id, id))
    .returning();
  return result[0];
}

export async function deleteSustainabilityESG(id: number): Promise<void> {
  await db.delete(evolutionSustainabilityESG).where(eq(evolutionSustainabilityESG.id, id));
}

// API object for easier imports
export const evolutionSustainabilityESGApi = {
  get: getSustainabilityESG,
  getAll: getAllSustainabilityESG,
  create: createSustainabilityESG,
  update: updateSustainabilityESG,
  delete: deleteSustainabilityESG,
};

// Query keys for React Query
export const evolutionSustainabilityESGKeys = {
  all: ['evolution-sustainability-esg'] as const,
  lists: () => [...evolutionSustainabilityESGKeys.all, 'list'] as const,
  list: (filters: string) => [...evolutionSustainabilityESGKeys.lists(), { filters }] as const,
  details: () => [...evolutionSustainabilityESGKeys.all, 'detail'] as const,
  detail: (id: number) => [...evolutionSustainabilityESGKeys.details(), id] as const,
};