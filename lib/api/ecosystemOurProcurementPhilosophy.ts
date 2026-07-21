import { EcosystemOurProcurementPhilosophy, EcosystemOurProcurementPhilosophyInsert } from '@/db/schema';

const API_BASE = '/api/ecosystem/our-procurement-philosophy';

export const ecosystemOurProcurementPhilosophyApi = {
    // Get procurement philosophy data
    get: async (): Promise<EcosystemOurProcurementPhilosophy> => {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Failed to fetch procurement philosophy');
        }
        return response.json();
    },

    // Get procurement philosophy by ID
    getById: async (id: number): Promise<EcosystemOurProcurementPhilosophy> => {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch procurement philosophy');
        }
        return response.json();
    },

    // Create new procurement philosophy
    create: async (data: EcosystemOurProcurementPhilosophyInsert): Promise<EcosystemOurProcurementPhilosophy> => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create procurement philosophy');
        }
        return response.json();
    },

    // Update procurement philosophy
    update: async (id: number, data: Partial<EcosystemOurProcurementPhilosophyInsert>): Promise<EcosystemOurProcurementPhilosophy> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update procurement philosophy');
        }
        return response.json();
    },

    // Delete procurement philosophy
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete procurement philosophy');
        }
    },
};