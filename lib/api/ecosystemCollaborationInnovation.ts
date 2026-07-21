import { EcosystemCollaborationInnovation, EcosystemCollaborationInnovationInsert } from '@/db/schema';

const API_BASE_URL = '/api/ecosystem/collaboration-innovation';

export const ecosystemCollaborationInnovationApi = {
    // Get collaboration innovation data
    get: async (): Promise<EcosystemCollaborationInnovation> => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch collaboration innovation data');
        }
        return response.json();
    },

    // Get all collaboration innovation data (alias for consistency)
    getAll: async (): Promise<EcosystemCollaborationInnovation> => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch collaboration innovation data');
        }
        return response.json();
    },

    // Get collaboration innovation data by ID
    getById: async (id: number): Promise<EcosystemCollaborationInnovation> => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch collaboration innovation data');
        }
        return response.json();
    },

    // Create new collaboration innovation data
    create: async (data: EcosystemCollaborationInnovationInsert): Promise<EcosystemCollaborationInnovation> => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create collaboration innovation data');
        }
        return response.json();
    },

    // Update collaboration innovation data
    update: async (id: number, data: Partial<EcosystemCollaborationInnovationInsert>): Promise<EcosystemCollaborationInnovation> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update collaboration innovation data');
        }
        return response.json();
    },

    // Delete collaboration innovation data
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete collaboration innovation data');
        }
    },
};