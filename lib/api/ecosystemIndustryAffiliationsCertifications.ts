import { apiClient } from '@/lib/api-client';
import { EcosystemIndustryAffiliationsCertifications, EcosystemIndustryAffiliationsCertificationsInsert } from '@/db/schema';

const BASE_URL = '/api/ecosystem/industry-affiliations-certifications';

export const ecosystemIndustryAffiliationsCertificationsApi = {
    // Get industry affiliations & certifications data
    get: async (): Promise<EcosystemIndustryAffiliationsCertifications> => {
        const response = await apiClient.get(BASE_URL);
        return response.data || response;
    },

    // Get industry affiliations & certifications data by ID
    getById: async (id: number): Promise<EcosystemIndustryAffiliationsCertifications> => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data || response;
    },

    // Create new industry affiliations & certifications data
    create: async (data: EcosystemIndustryAffiliationsCertificationsInsert): Promise<EcosystemIndustryAffiliationsCertifications> => {
        const response = await apiClient.post(BASE_URL, data);
        return response.data || response;
    },

    // Update industry affiliations & certifications data
    update: async (id: number, data: Partial<EcosystemIndustryAffiliationsCertificationsInsert>): Promise<EcosystemIndustryAffiliationsCertifications> => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, data);
        return response.data || response;
    },

    // Delete industry affiliations & certifications data
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};