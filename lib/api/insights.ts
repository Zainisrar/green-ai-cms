// Insights API types
export interface InsightKey {
  icon: string;
  text: string;
}

export interface InsightCTA {
  text: string;
  link: string;
}

export interface MiningInsight {
  id?: number;
  headline: string;
  subheadline: string;
  highlighted: string;
  description: string;
  bgImg: string;
  keys: InsightKey[];
  cta1: InsightCTA;
  cta2: InsightCTA;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInsightData {
  headline: string;
  subheadline: string;
  highlighted: string;
  description: string;
  bgImg: string;
  keys: InsightKey[];
  cta1: InsightCTA;
  cta2: InsightCTA;
}

export interface UpdateInsightData extends CreateInsightData {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Query Keys
export const insightKeys = {
  all: ['insights'] as const,
  lists: () => [...insightKeys.all, 'list'] as const,
  list: (filters?: string) => [...insightKeys.lists(), { filters }] as const,
  details: () => [...insightKeys.all, 'detail'] as const,
  detail: (id: string) => [...insightKeys.details(), id] as const,
};

// API Functions
export const insightApi = {
  // Get all insights
  getAll: async (): Promise<MiningInsight[]> => {
    const response = await fetch('/api/insights');
    if (!response.ok) {
      throw new Error('Failed to fetch insights');
    }
    const result: ApiResponse<MiningInsight[]> = await response.json();
    return result.data;
  },

  // Get single insight by ID
  getById: async (id: string): Promise<MiningInsight> => {
    const response = await fetch(`/api/insights?id=${id}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch insight with id: ${id}`);
    }
    const result: ApiResponse<MiningInsight> = await response.json();
    return result.data;
  },

  // Create new insight
  create: async (data: CreateInsightData): Promise<MiningInsight> => {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to create insight');
    }
    const result: ApiResponse<MiningInsight> = await response.json();
    return result.data;
  },

  // Update existing insight
  update: async (id: string, data: UpdateInsightData): Promise<MiningInsight> => {
    const response = await fetch(`/api/insights?id=${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to update insight with id: ${id}`);
    }
    const result: ApiResponse<MiningInsight> = await response.json();
    return result.data;
  },

  // Delete insight
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/insights?id=${id}`, { 
      method: 'DELETE' 
    });
    if (!response.ok) {
      throw new Error(`Failed to delete insight with id: ${id}`);
    }
  }
};