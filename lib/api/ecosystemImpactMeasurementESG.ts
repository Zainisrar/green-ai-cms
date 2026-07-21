import { EcosystemImpactMeasurementESG, EcosystemImpactMeasurementESGInsert } from '@/db/schema';

const API_BASE_URL = '/api/ecosystem/impact-measurement-esg';

export const ecosystemImpactMeasurementESGApi = {
    // Get all data (returns first record)
    getAll: async (): Promise<EcosystemImpactMeasurementESG> => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch ecosystem impact measurement ESG data');
        }
        return response.json();
    },

    // Get data by ID
    getById: async (id: number): Promise<EcosystemImpactMeasurementESG> => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ecosystem impact measurement ESG data');
        }
        return response.json();
    },

    // Create new data
    create: async (data: EcosystemImpactMeasurementESGInsert): Promise<EcosystemImpactMeasurementESG> => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create ecosystem impact measurement ESG data');
        }
        return response.json();
    },

    // Update data by ID
    update: async (id: number, data: Partial<EcosystemImpactMeasurementESGInsert>): Promise<EcosystemImpactMeasurementESG> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update ecosystem impact measurement ESG data');
        }
        return response.json();
    },

    // Delete data by ID
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete ecosystem impact measurement ESG data');
        }
    },
};