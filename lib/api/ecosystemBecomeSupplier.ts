import { EcosystemBecomeSupplier, EcosystemBecomeSupplierInsert } from '@/db/schema';

const API_BASE = '/api/ecosystem/become-a-supplier';

export const ecosystemBecomeSupplierApi = {
    // Get become a supplier data
    get: async (): Promise<EcosystemBecomeSupplier> => {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Failed to fetch become a supplier');
        }
        return response.json();
    },

    // Get become a supplier by ID
    getById: async (id: number): Promise<EcosystemBecomeSupplier> => {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch become a supplier');
        }
        return response.json();
    },

    // Create new become a supplier
    create: async (data: EcosystemBecomeSupplierInsert): Promise<EcosystemBecomeSupplier> => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create become a supplier');
        }
        return response.json();
    },

    // Update become a supplier
    update: async (id: number, data: Partial<EcosystemBecomeSupplierInsert>): Promise<EcosystemBecomeSupplier> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update become a supplier');
        }
        return response.json();
    },

    // Delete become a supplier
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete become a supplier');
        }
    },
};