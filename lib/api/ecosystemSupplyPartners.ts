import { apiClient } from '@/lib/api-client';
import { EcosystemSupplyPartners, EcosystemSupplyPartnersInsert } from '@/db/schema';

const BASE_URL = '/api/ecosystem/supply-partners';

export const ecosystemSupplyPartnersApi = {
    // Get all supply partners data
    getAll: async (): Promise<EcosystemSupplyPartners> => {
        const response = await apiClient.get(BASE_URL);
        return response.data || response;
    },

    // Get the ecosystem supply partners data (there should only be one record)
    async get(): Promise<EcosystemSupplyPartners> {
        const response = await apiClient.get(BASE_URL);
        return response.data || response;
    },

    // Get specific ecosystem supply partners data by ID
    async getById(id: number): Promise<EcosystemSupplyPartners> {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data || response;
    },

    // Create or update ecosystem supply partners data
    async createOrUpdate(data: EcosystemSupplyPartnersInsert): Promise<EcosystemSupplyPartners> {
        const response = await apiClient.post(BASE_URL, data);
        return response.data || response;
    },

    // Create new supply partners data
    create: async (data: EcosystemSupplyPartnersInsert): Promise<EcosystemSupplyPartners> => {
        const response = await apiClient.post(BASE_URL, data);
        return response.data || response;
    },

    // Update specific ecosystem supply partners data by ID
    async update(id: number, data: Partial<EcosystemSupplyPartnersInsert>): Promise<EcosystemSupplyPartners> {
        const response = await apiClient.put(`${BASE_URL}/${id}`, data);
        return response.data || response;
    },

    // Update specific section of ecosystem supply partners data
    async updateSection(
        id: number, 
        section: 'mainPage' | 'globalSourcingStrategy' | 'whatWeProcure' | 'howBecomeGreenSupplier',
        sectionData: any
    ): Promise<EcosystemSupplyPartners> {
        // First get current data
        const currentData = await this.getById(id);
        
        // Update the specific section
        const updateData = {
            ...currentData,
            [section]: sectionData
        };

        return this.update(id, updateData);
    },

    // Delete ecosystem supply partners data by ID
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};