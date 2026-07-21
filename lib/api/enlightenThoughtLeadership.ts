import { EnlightenThoughtLeadership, EnlightenThoughtLeadershipInsert } from '@/db/schema';

export const enlightenThoughtLeadershipApi = {
    // Get thought leadership data
    getThoughtLeadership: async (): Promise<EnlightenThoughtLeadership | null> => {
        const response = await fetch('/api/enlighten/thought-leadership');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch thought leadership data');
        }
        
        return result.data;
    },

    // Create thought leadership data
    createThoughtLeadership: async (data: EnlightenThoughtLeadershipInsert): Promise<EnlightenThoughtLeadership> => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/enlighten/thought-leadership', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to create thought leadership data');
        }
        
        return result.data;
    },

    // Update thought leadership data
    updateThoughtLeadership: async (id: number, data: Partial<EnlightenThoughtLeadershipInsert>): Promise<EnlightenThoughtLeadership> => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/enlighten/thought-leadership', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id, ...data }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to update thought leadership data');
        }
        
        return result.data;
    },
};