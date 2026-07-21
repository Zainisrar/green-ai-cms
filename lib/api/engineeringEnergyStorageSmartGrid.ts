import { db } from '@/db';
import { engineeringEnergyStorageSmartGrid, type EngineeringEnergyStorageSmartGrid, type EngineeringEnergyStorageSmartGridInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getEnergyStorageSmartGrid(): Promise<EngineeringEnergyStorageSmartGrid | null> {
  const result = await db.select().from(engineeringEnergyStorageSmartGrid).limit(1);
  return result[0] || null;
}

export async function getAllEnergyStorageSmartGrid(): Promise<EngineeringEnergyStorageSmartGrid[]> {
  return await db.select().from(engineeringEnergyStorageSmartGrid);
}

export async function createEnergyStorageSmartGrid(data: EngineeringEnergyStorageSmartGridInsert): Promise<EngineeringEnergyStorageSmartGrid> {
  const result = await db.insert(engineeringEnergyStorageSmartGrid).values(data).returning();
  return result[0];
}

export async function updateEnergyStorageSmartGrid(id: number, data: Partial<EngineeringEnergyStorageSmartGridInsert>): Promise<EngineeringEnergyStorageSmartGrid> {
  const result = await db
    .update(engineeringEnergyStorageSmartGrid)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(engineeringEnergyStorageSmartGrid.id, id))
    .returning();
  return result[0];
}

export async function deleteEnergyStorageSmartGrid(id: number): Promise<void> {
  await db.delete(engineeringEnergyStorageSmartGrid).where(eq(engineeringEnergyStorageSmartGrid.id, id));
}

// API object for easier imports
export const engineeringEnergyStorageSmartGridApi = {
  get: getEnergyStorageSmartGrid,
  getAll: getAllEnergyStorageSmartGrid,
  create: createEnergyStorageSmartGrid,
  update: updateEnergyStorageSmartGrid,
  delete: deleteEnergyStorageSmartGrid,
};

// Query keys for React Query
export const engineeringEnergyStorageSmartGridKeys = {
  all: ['engineering-energy-storage-smart-grid'] as const,
  lists: () => [...engineeringEnergyStorageSmartGridKeys.all, 'list'] as const,
  list: (filters: string) => [...engineeringEnergyStorageSmartGridKeys.lists(), { filters }] as const,
  details: () => [...engineeringEnergyStorageSmartGridKeys.all, 'detail'] as const,
  detail: (id: number) => [...engineeringEnergyStorageSmartGridKeys.details(), id] as const,
};