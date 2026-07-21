import { db } from '@/db';
import { engineeringOMMonitoring, type EngineeringOMMonitoring, type EngineeringOMMonitoringInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getOMMonitoring(): Promise<EngineeringOMMonitoring | null> {
  const result = await db.select().from(engineeringOMMonitoring).limit(1);
  return result[0] || null;
}

export async function getAllOMMonitoring(): Promise<EngineeringOMMonitoring[]> {
  return await db.select().from(engineeringOMMonitoring);
}

export async function createOMMonitoring(data: EngineeringOMMonitoringInsert): Promise<EngineeringOMMonitoring> {
  const result = await db.insert(engineeringOMMonitoring).values(data).returning();
  return result[0];
}

export async function updateOMMonitoring(id: number, data: Partial<EngineeringOMMonitoringInsert>): Promise<EngineeringOMMonitoring> {
  const result = await db
    .update(engineeringOMMonitoring)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(engineeringOMMonitoring.id, id))
    .returning();
  return result[0];
}

export async function deleteOMMonitoring(id: number): Promise<void> {
  await db.delete(engineeringOMMonitoring).where(eq(engineeringOMMonitoring.id, id));
}

// API object for easier imports
export const engineeringOMMonitoringApi = {
  get: getOMMonitoring,
  getAll: getAllOMMonitoring,
  create: createOMMonitoring,
  update: updateOMMonitoring,
  delete: deleteOMMonitoring,
};

// Query keys for React Query
export const engineeringOMMonitoringKeys = {
  all: ['engineering-om-monitoring'] as const,
  lists: () => [...engineeringOMMonitoringKeys.all, 'list'] as const,
  list: (filters: string) => [...engineeringOMMonitoringKeys.lists(), { filters }] as const,
  details: () => [...engineeringOMMonitoringKeys.all, 'detail'] as const,
  detail: (id: number) => [...engineeringOMMonitoringKeys.details(), id] as const,
};