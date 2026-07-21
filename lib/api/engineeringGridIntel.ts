import { db } from '@/db';
import { engineeringGridIntel, type EngineeringGridIntel, type EngineeringGridIntelInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getGridIntel(): Promise<EngineeringGridIntel | null> {
  const result = await db.select().from(engineeringGridIntel).limit(1);
  return result[0] || null;
}

export async function getAllGridIntel(): Promise<EngineeringGridIntel[]> {
  return await db.select().from(engineeringGridIntel);
}

export async function createGridIntel(data: EngineeringGridIntelInsert): Promise<EngineeringGridIntel> {
  const result = await db.insert(engineeringGridIntel).values(data).returning();
  return result[0];
}

export async function updateGridIntel(id: number, data: Partial<EngineeringGridIntelInsert>): Promise<EngineeringGridIntel> {
  const result = await db
    .update(engineeringGridIntel)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(engineeringGridIntel.id, id))
    .returning();
  return result[0];
}

export async function deleteGridIntel(id: number): Promise<void> {
  await db.delete(engineeringGridIntel).where(eq(engineeringGridIntel.id, id));
}

// API object for easier imports
export const engineeringGridIntelApi = {
  get: getGridIntel,
  getAll: getAllGridIntel,
  create: createGridIntel,
  update: updateGridIntel,
  delete: deleteGridIntel,
};

// Query keys for React Query
export const engineeringGridIntelKeys = {
  all: ['engineering-grid-intel'] as const,
  lists: () => [...engineeringGridIntelKeys.all, 'list'] as const,
  list: (filters: string) => [...engineeringGridIntelKeys.lists(), { filters }] as const,
  details: () => [...engineeringGridIntelKeys.all, 'detail'] as const,
  detail: (id: number) => [...engineeringGridIntelKeys.details(), id] as const,
};