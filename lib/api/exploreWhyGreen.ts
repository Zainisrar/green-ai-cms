import { ExploreWhyGreen, ExploreWhyGreenInsert } from '@/db/schema';

export interface ExploreWhyGreenKey {
  text: string;
}

export interface ExploreWhyGreenIcon {
  text: string;
  img: {
    src: string;
    alt: string;
  };
  description: string;
}

export interface ExploreWhyGreenData {
  key: ExploreWhyGreenKey;
  content: string;
  icons: ExploreWhyGreenIcon[];
}

export interface ExploreWhyGreenUpdateData extends ExploreWhyGreenData {
  id: string;
}

const API_BASE_URL = '/api/explore/why-green';

export const exploreWhyGreenApi = {
  // Get all why-green entries
  getAll: async (): Promise<ExploreWhyGreen[]> => {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch why-green entries');
    }
    
    return result.data;
  },

  // Get why-green entry by ID
  getById: async (id: string): Promise<ExploreWhyGreen> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch why-green entry');
    }
    
    return result.data;
  },

  // Create new why-green entry
  create: async (data: ExploreWhyGreenData): Promise<ExploreWhyGreen> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create why-green entry');
    }
    
    return result.data;
  },

  // Update why-green entry by ID
  updateById: async (id: string, data: Partial<ExploreWhyGreenData>): Promise<ExploreWhyGreen> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update why-green entry');
    }
    
    return result.data;
  },

  // Delete why-green entry by ID
  deleteById: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete why-green entry');
    }
  },
};

// Query keys for React Query
export const exploreWhyGreenKeys = {
  all: ['exploreWhyGreen'] as const,
  lists: () => [...exploreWhyGreenKeys.all, 'list'] as const,
  list: (filters: string) => [...exploreWhyGreenKeys.lists(), { filters }] as const,
  details: () => [...exploreWhyGreenKeys.all, 'detail'] as const,
  detail: (id: string) => [...exploreWhyGreenKeys.details(), id] as const,
};