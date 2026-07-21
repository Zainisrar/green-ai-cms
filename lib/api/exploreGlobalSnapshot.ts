import { ExploreGlobalSnapshot, ExploreGlobalSnapshotInsert, GlobalSnapshotSection } from '@/db/schema';

export interface ExploreGlobalSnapshotData {
  sections: GlobalSnapshotSection[];
}

export interface ExploreGlobalSnapshotUpdateData extends ExploreGlobalSnapshotData {
  id: string;
}

const API_BASE_URL = '/api/explore/global-snapshot';

export const exploreGlobalSnapshotApi = {
  // Get all global-snapshot entries
  getAll: async (): Promise<ExploreGlobalSnapshot[]> => {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch global-snapshot entries');
    }
    
    return result.data;
  },

  // Get global-snapshot entry by ID
  getById: async (id: string): Promise<ExploreGlobalSnapshot> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch global-snapshot entry');
    }
    
    return result.data;
  },

  // Create new global-snapshot entry
  create: async (data: ExploreGlobalSnapshotData): Promise<ExploreGlobalSnapshot> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create global-snapshot entry');
    }
    
    return result.data;
  },

  // Update global-snapshot entry by ID
  updateById: async (id: string, data: Partial<ExploreGlobalSnapshotData>): Promise<ExploreGlobalSnapshot> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update global-snapshot entry');
    }
    
    return result.data;
  },

  // Delete global-snapshot entry by ID
  deleteById: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete global-snapshot entry');
    }
  },
};

// Query keys for React Query
export const exploreGlobalSnapshotKeys = {
  all: ['exploreGlobalSnapshot'] as const,
  lists: () => [...exploreGlobalSnapshotKeys.all, 'list'] as const,
  list: (filters: string) => [...exploreGlobalSnapshotKeys.lists(), { filters }] as const,
  details: () => [...exploreGlobalSnapshotKeys.all, 'detail'] as const,
  detail: (id: string) => [...exploreGlobalSnapshotKeys.details(), id] as const,
};

// Helper functions for section management
export const sectionHelpers = {
  // Create a new hero section
  createHeroSection: (data: Partial<any> = {}) => ({
    id: data.id || 'hero',
    type: 'hero-section' as const,
    title: {
      main: data.title?.main || '',
      highlight: data.title?.highlight || '',
    },
    subtitle: data.subtitle || '',
    headline: data.headline || '',
    description: data.description || [],
  }),

  // Create a new statistics grid section
  createStatisticsGrid: (data: Partial<any> = {}) => ({
    id: data.id || 'stats',
    type: 'statistics-grid' as const,
    items: data.items || [],
  }),

  // Create a new highlight box section
  createHighlightBox: (data: Partial<any> = {}) => ({
    id: data.id || 'highlight',
    type: 'highlight-box' as const,
    content: {
      lines: data.content?.lines || [],
      style: data.content?.style || 'italic-green-highlight',
    },
  }),

  // Create a new content block section
  createContentBlock: (data: Partial<any> = {}) => ({
    id: data.id || 'content',
    type: 'content-block' as const,
    title: {
      text: data.title?.text || '',
      highlight: data.title?.highlight || '',
    },
    features: data.features || [],
  }),

  // Create a new locations section
  createLocationsSection: (data: Partial<any> = {}) => ({
    id: data.id || 'locations',
    type: 'locations-section' as const,
    title: data.title || '',
    locations: data.locations || [],
    description: data.description || '',
    highlight: data.highlight || '',
  }),

  // Create a new action buttons section
  createActionButtons: (data: Partial<any> = {}) => ({
    id: data.id || 'cta',
    type: 'action-buttons' as const,
    buttons: data.buttons || [],
  }),
};