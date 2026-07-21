import { db } from '@/db';
import { engineeringSolarEPCM, type EngineeringSolarEPCM, type EngineeringSolarEPCMInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getSolarEPCM(): Promise<EngineeringSolarEPCM | null> {
  const result = await db.select().from(engineeringSolarEPCM).limit(1);
  return result[0] || null;
}

export async function getAllSolarEPCM(): Promise<EngineeringSolarEPCM[]> {
  return await db.select().from(engineeringSolarEPCM);
}

export async function createSolarEPCM(data: EngineeringSolarEPCMInsert): Promise<EngineeringSolarEPCM> {
  const result = await db.insert(engineeringSolarEPCM).values(data).returning();
  return result[0];
}

export async function updateSolarEPCM(id: number, data: Partial<EngineeringSolarEPCMInsert>): Promise<EngineeringSolarEPCM> {
  const result = await db
    .update(engineeringSolarEPCM)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(engineeringSolarEPCM.id, id))
    .returning();
  return result[0];
}

export async function deleteSolarEPCM(id: number): Promise<void> {
  await db.delete(engineeringSolarEPCM).where(eq(engineeringSolarEPCM.id, id));
}

// API object for easier imports
export const engineeringSolarEPCMApi = {
  get: getSolarEPCM,
  getAll: getAllSolarEPCM,
  create: createSolarEPCM,
  update: updateSolarEPCM,
  delete: deleteSolarEPCM,
};

// Query keys for React Query
export const engineeringSolarEPCMKeys = {
  all: ['engineering-solar-epcm'] as const,
  lists: () => [...engineeringSolarEPCMKeys.all, 'list'] as const,
  list: (filters: string) => [...engineeringSolarEPCMKeys.lists(), { filters }] as const,
  details: () => [...engineeringSolarEPCMKeys.all, 'detail'] as const,
  detail: (id: number) => [...engineeringSolarEPCMKeys.details(), id] as const,
};