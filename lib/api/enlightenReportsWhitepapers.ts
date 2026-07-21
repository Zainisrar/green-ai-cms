import { EnlightenReportsWhitepaper, EnlightenReportsWhitepaperInsert } from '@/db/schema';

const API_BASE_URL = '/api/enlighten/reports-whitepapers';

export const enlightenReportsWhitepapersApi = {
    // Get all reports
    getAll: async (): Promise<EnlightenReportsWhitepaper[]> => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }
        return response.json();
    },

    // Create new report
    create: async (report: Omit<EnlightenReportsWhitepaperInsert, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnlightenReportsWhitepaper> => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(report),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create report');
        }
        return response.json();
    },

    // Update report
    update: async (report: Partial<EnlightenReportsWhitepaper> & { id: number }): Promise<EnlightenReportsWhitepaper> => {
        const response = await fetch(API_BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(report),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update report');
        }
        return response.json();
    },

    // Delete report
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete report');
        }
    },
};