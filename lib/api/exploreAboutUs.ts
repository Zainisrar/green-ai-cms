import { ExploreAboutUs, ExploreAboutUsInsert } from '@/db/schema';

export interface ExploreAboutUsData {
  title: string;
  key: string;
  content: string;
  quote: string;
  bgImg: string;
}

export interface ExploreAboutUsUpdateData extends ExploreAboutUsData {
  id: string;
}

const API_BASE_URL = '/api/explore/about-us';

export const exploreAboutUsApi = {
  // Get all about-us entries
  getAll: async (): Promise<ExploreAboutUs[]> => {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch about-us entries');
    }
    
    return result.data;
  },

  // Get about-us entry by ID
  getById: async (id: string): Promise<ExploreAboutUs> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch about-us entry');
    }
    
    return result.data;
  },

  // Get about-us entry by key
  getByKey: async (key: string): Promise<ExploreAboutUs> => {
    const response = await fetch(`${API_BASE_URL}?key=${key}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch about-us entry');
    }
    
    return result.data;
  },

  // Create new about-us entry
  create: async (data: ExploreAboutUsData): Promise<ExploreAboutUs> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create about-us entry');
    }
    
    return result.data;
  },

  // Update about-us entry by ID
  updateById: async (id: string, data: Partial<ExploreAboutUsData>): Promise<ExploreAboutUs> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update about-us entry');
    }
    
    return result.data;
  },

  // Update about-us entry by key
  updateByKey: async (key: string, data: Partial<ExploreAboutUsData>): Promise<ExploreAboutUs> => {
    const response = await fetch(`${API_BASE_URL}?key=${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update about-us entry');
    }
    
    return result.data;
  },

  // Delete about-us entry by ID
  deleteById: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete about-us entry');
    }
  },

  // Delete about-us entry by key
  deleteByKey: async (key: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}?key=${key}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete about-us entry');
    }
  },
};

// Query keys for React Query
export const exploreAboutUsKeys = {
  all: ['exploreAboutUs'] as const,
  lists: () => [...exploreAboutUsKeys.all, 'list'] as const,
  list: (filters: string) => [...exploreAboutUsKeys.lists(), { filters }] as const,
  details: () => [...exploreAboutUsKeys.all, 'detail'] as const,
  detail: (id: string) => [...exploreAboutUsKeys.details(), id] as const,
  detailByKey: (key: string) => [...exploreAboutUsKeys.details(), 'key', key] as const,
};