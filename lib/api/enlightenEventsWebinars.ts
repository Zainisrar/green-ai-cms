import { EnlightenEventsWebinars, EnlightenEventsWebinarsInsert } from '@/db/schema';

export const enlightenEventsWebinarsApi = {
    // Get events/webinars data
    getEventsWebinars: async (): Promise<EnlightenEventsWebinars | null> => {
        const response = await fetch('/api/enlighten/events-webinars');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch events/webinars data');
        }
        
        return result.data;
    },

    // Create events/webinars data
    createEventsWebinars: async (data: EnlightenEventsWebinarsInsert): Promise<EnlightenEventsWebinars> => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/enlighten/events-webinars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to create events/webinars data');
        }
        
        return result.data;
    },

    // Update events/webinars data
    updateEventsWebinars: async (id: number, data: Partial<EnlightenEventsWebinarsInsert>): Promise<EnlightenEventsWebinars> => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/enlighten/events-webinars', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id, ...data }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to update events/webinars data');
        }
        
        return result.data;
    },
};