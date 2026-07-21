import { db } from '@/db';
import { engineeringHybridMicrogrid, type EngineeringHybridMicrogrid, type EngineeringHybridMicrogridInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getHybridMicrogrid(): Promise<EngineeringHybridMicrogrid | null> {
  const result = await db.select().from(engineeringHybridMicrogrid).limit(1);
  return result[0] || null;
}

export async function getAllHybridMicrogrid(): Promise<EngineeringHybridMicrogrid[]> {
  return await db.select().from(engineeringHybridMicrogrid);
}

export async function createHybridMicrogrid(data: EngineeringHybridMicrogridInsert): Promise<EngineeringHybridMicrogrid> {
  const result = await db.insert(engineeringHybridMicrogrid).values(data).returning();
  return result[0];
}

export async function updateHybridMicrogrid(id: number, data: Partial<EngineeringHybridMicrogridInsert>): Promise<EngineeringHybridMicrogrid> {
  const result = await db
    .update(engineeringHybridMicrogrid)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(engineeringHybridMicrogrid.id, id))
    .returning();
  return result[0];
}

export async function deleteHybridMicrogrid(id: number): Promise<void> {
  await db.delete(engineeringHybridMicrogrid).where(eq(engineeringHybridMicrogrid.id, id));
}

// API object for easier imports
export const engineeringHybridMicrogridApi = {
  get: getHybridMicrogrid,
  getAll: getAllHybridMicrogrid,
  create: createHybridMicrogrid,
  update: updateHybridMicrogrid,
  delete: deleteHybridMicrogrid,
};

// Query keys for React Query
export const engineeringHybridMicrogridKeys = {
  all: ['engineering-hybrid-microgrid'] as const,
  lists: () => [...engineeringHybridMicrogridKeys.all, 'list'] as const,
  list: (filters: string) => [...engineeringHybridMicrogridKeys.lists(), { filters }] as const,
  details: () => [...engineeringHybridMicrogridKeys.all, 'detail'] as const,
  detail: (id: number) => [...engineeringHybridMicrogridKeys.details(), id] as const,
};