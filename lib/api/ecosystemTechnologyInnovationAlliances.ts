import { apiClient } from '../api-client';
import type { 
    EcosystemTechnologyInnovationAlliances, 
    EcosystemTechnologyInnovationAlliancesInsert 
} from '@/db/schema';

export const ecosystemTechnologyInnovationAlliancesApi = {
    // Get all records
    getAll: async (): Promise<EcosystemTechnologyInnovationAlliances[]> => {
        const response = await apiClient.get('/api/ecosystem/technology-innovation-alliances');
        return response.data;
    },

    // Get single record by ID
    getById: async (id: number): Promise<EcosystemTechnologyInnovationAlliances> => {
        const response = await apiClient.get(`/api/ecosystem/technology-innovation-alliances/${id}`);
        return response.data;
    },

    // Create new record
    create: async (data: EcosystemTechnologyInnovationAlliancesInsert): Promise<EcosystemTechnologyInnovationAlliances> => {
        const response = await apiClient.post('/api/ecosystem/technology-innovation-alliances', data);
        return response.data;
    },

    // Update existing record
    update: async (id: number, data: Partial<EcosystemTechnologyInnovationAlliancesInsert>): Promise<EcosystemTechnologyInnovationAlliances> => {
        const response = await apiClient.put(`/api/ecosystem/technology-innovation-alliances/${id}`, data);
        return response.data;
    },

    // Delete record
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/ecosystem/technology-innovation-alliances/${id}`);
    },
};