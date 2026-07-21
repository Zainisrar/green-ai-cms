import { db } from '@/db';
import { evolutionCertificationsAccreditations, type EvolutionCertificationsAccreditations, type EvolutionCertificationsAccreditationsInsert } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getCertificationsAccreditations(): Promise<EvolutionCertificationsAccreditations | null> {
  const result = await db.select().from(evolutionCertificationsAccreditations).limit(1);
  return result[0] || null;
}

export async function getAllCertificationsAccreditations(): Promise<EvolutionCertificationsAccreditations[]> {
  return await db.select().from(evolutionCertificationsAccreditations);
}

export async function createCertificationsAccreditations(data: EvolutionCertificationsAccreditationsInsert): Promise<EvolutionCertificationsAccreditations> {
  const result = await db.insert(evolutionCertificationsAccreditations).values(data).returning();
  return result[0];
}

export async function updateCertificationsAccreditations(id: number, data: Partial<EvolutionCertificationsAccreditationsInsert>): Promise<EvolutionCertificationsAccreditations> {
  const result = await db
    .update(evolutionCertificationsAccreditations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(evolutionCertificationsAccreditations.id, id))
    .returning();
  return result[0];
}

export async function deleteCertificationsAccreditations(id: number): Promise<void> {
  await db.delete(evolutionCertificationsAccreditations).where(eq(evolutionCertificationsAccreditations.id, id));
}

// API object for easier imports
export const evolutionCertificationsAccreditationsApi = {
  get: getCertificationsAccreditations,
  getAll: getAllCertificationsAccreditations,
  create: createCertificationsAccreditations,
  update: updateCertificationsAccreditations,
  delete: deleteCertificationsAccreditations,
};

// Query keys for React Query
export const evolutionCertificationsAccreditationsKeys = {
  all: ['evolution-certifications-accreditations'] as const,
  lists: () => [...evolutionCertificationsAccreditationsKeys.all, 'list'] as const,
  list: (filters: string) => [...evolutionCertificationsAccreditationsKeys.lists(), { filters }] as const,
  details: () => [...evolutionCertificationsAccreditationsKeys.all, 'detail'] as const,
  detail: (id: number) => [...evolutionCertificationsAccreditationsKeys.details(), id] as const,
};