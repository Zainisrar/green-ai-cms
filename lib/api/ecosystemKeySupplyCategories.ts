import { EcosystemKeySupplyCategories, EcosystemKeySupplyCategoriesInsert } from '@/db/schema';

const API_BASE = '/api/ecosystem/key-supply-categories';

export const ecosystemKeySupplyCategoriesApi = {
    // Get key supply categories data
    get: async (): Promise<EcosystemKeySupplyCategories> => {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Failed to fetch key supply categories');
        }
        return response.json();
    },

    // Get key supply categories by ID
    getById: async (id: number): Promise<EcosystemKeySupplyCategories> => {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch key supply categories');
        }
        return response.json();
    },

    // Create new key supply categories
    create: async (data: EcosystemKeySupplyCategoriesInsert): Promise<EcosystemKeySupplyCategories> => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create key supply categories');
        }
        return response.json();
    },

    // Update key supply categories
    update: async (id: number, data: Partial<EcosystemKeySupplyCategoriesInsert>): Promise<EcosystemKeySupplyCategories> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update key supply categories');
        }
        return response.json();
    },

    // Delete key supply categories
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete key supply categories');
        }
    },
};