import { apiClient } from '@/lib/api-client';
import type { EcosystemCommunityImpactLoop, EcosystemCommunityImpactLoopInsert } from '@/db/schema';

const BASE_URL = '/api/ecosystem/community-impact-loop';

export const ecosystemCommunityImpactLoopApi = {
    // Get all community impact loop data
    getAll: async (): Promise<EcosystemCommunityImpactLoop> => {
        const response = await apiClient.get(BASE_URL);
        return response.data || response;
    },

    // Get community impact loop data by ID
    getById: async (id: number): Promise<EcosystemCommunityImpactLoop> => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data || response;
    },

    // Create new community impact loop data
    create: async (data: EcosystemCommunityImpactLoopInsert): Promise<EcosystemCommunityImpactLoop> => {
        const response = await apiClient.post(BASE_URL, data);
        return response.data || response;
    },

    // Update community impact loop data
    update: async (id: number, data: Partial<EcosystemCommunityImpactLoopInsert>): Promise<EcosystemCommunityImpactLoop> => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, data);
        return response.data || response;
    },

    // Delete community impact loop data
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};