import { EcosystemOurValueChain, EcosystemOurValueChainInsert } from '@/db/schema';

const BASE_URL = '/api/ecosystem/our-value-chain';

export const ecosystemOurValueChainApi = {
    // Get the ecosystem value chain data (there should only be one record)
    async get(): Promise<EcosystemOurValueChain> {
        const response = await fetch(BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch ecosystem value chain data');
        }
        return response.json();
    },

    // Get specific ecosystem value chain data by ID
    async getById(id: number): Promise<EcosystemOurValueChain> {
        const response = await fetch(`${BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ecosystem value chain data');
        }
        return response.json();
    },

    // Create or update ecosystem value chain data
    async createOrUpdate(data: EcosystemOurValueChainInsert): Promise<EcosystemOurValueChain> {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error('Failed to save ecosystem value chain data');
        }
        return response.json();
    },

    // Update specific ecosystem value chain data by ID
    async update(id: number, data: Partial<EcosystemOurValueChainInsert>): Promise<EcosystemOurValueChain> {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error('Failed to update ecosystem value chain data');
        }
        return response.json();
    },

    // Delete ecosystem value chain data by ID
    async delete(id: number): Promise<void> {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete ecosystem value chain data');
        }
    },
};