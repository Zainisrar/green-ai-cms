import { EcosystemClientPartnerships, EcosystemClientPartnershipsInsert } from '@/db/schema';

const API_BASE_URL = '/api/ecosystem/client-partnerships';

export const ecosystemClientPartnershipsApi = {
    // Get client partnerships data
    get: async (): Promise<EcosystemClientPartnerships> => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch client partnerships data');
        }
        return response.json();
    },

    // Get all client partnerships data (alias for consistency)
    getAll: async (): Promise<EcosystemClientPartnerships> => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch client partnerships data');
        }
        return response.json();
    },

    // Get client partnerships data by ID
    getById: async (id: number): Promise<EcosystemClientPartnerships> => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch client partnerships data');
        }
        return response.json();
    },

    // Create new client partnerships data
    create: async (data: EcosystemClientPartnershipsInsert): Promise<EcosystemClientPartnerships> => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create client partnerships data');
        }
        return response.json();
    },

    // Update client partnerships data
    update: async (id: number, data: Partial<EcosystemClientPartnershipsInsert>): Promise<EcosystemClientPartnerships> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update client partnerships data');
        }
        return response.json();
    },

    // Delete client partnerships data
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete client partnerships data');
        }
    },
};