import { EnlightenInsightsArticle, EnlightenInsightsArticleInsert } from '@/db/schema';

const API_BASE_URL = '/api/enlighten/insights-articles';

export const enlightenInsightsArticlesApi = {
    // Get all articles
    getAll: async (): Promise<EnlightenInsightsArticle[]> => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch articles');
        }
        return response.json();
    },

    // Create new article
    create: async (article: Omit<EnlightenInsightsArticleInsert, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnlightenInsightsArticle> => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(article),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create article');
        }
        return response.json();
    },

    // Update article
    update: async (article: Partial<EnlightenInsightsArticle> & { id: number }): Promise<EnlightenInsightsArticle> => {
        const response = await fetch(API_BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(article),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update article');
        }
        return response.json();
    },

    // Delete article
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete article');
        }
    },
};