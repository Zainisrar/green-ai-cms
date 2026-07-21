import type { EcosystemHandbook, EcosystemHandbookInsert } from '@/db/schema';

const API_BASE = '/api/ecosystem/handbook';

export const ecosystemHandbookApi = {
    // Get ecosystem handbook data
    get: async (): Promise<EcosystemHandbook> => {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Failed to fetch ecosystem handbook');
        }
        return response.json();
    },

    // Get all ecosystem handbook data (alias for consistency)
    getAll: async (): Promise<EcosystemHandbook> => {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Failed to fetch ecosystem handbook');
        }
        return response.json();
    },

    // Get ecosystem handbook by ID
    getById: async (id: number): Promise<EcosystemHandbook> => {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ecosystem handbook');
        }
        return response.json();
    },

    // Create new ecosystem handbook
    create: async (data: Omit<EcosystemHandbookInsert, 'id' | 'createdAt' | 'updatedAt'>): Promise<EcosystemHandbook> => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create ecosystem handbook');
        }
        return response.json();
    },

    // Update ecosystem handbook
    update: async (id: number, data: Partial<Omit<EcosystemHandbookInsert, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EcosystemHandbook> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update ecosystem handbook');
        }
        return response.json();
    },

    // Delete ecosystem handbook
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete ecosystem handbook');
        }
    },
};