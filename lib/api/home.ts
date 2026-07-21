// Home API types
export interface TextSection {
  headline: string;
  description?: string;
}

export interface HomeData {
  id?: number;
  text1: TextSection;
  text2: TextSection;
  text3: TextSection;
  text4: TextSection;
  text5: TextSection;
  slug: string; // "/home/{dynamic}"
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHomeData {
  text1: TextSection;
  text2: TextSection;
  text3: TextSection;
  text4: TextSection;
  text5: TextSection;
  slug: string;
}

export interface UpdateHomeData extends CreateHomeData {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Query Keys
export const homeKeys = {
  all: ['home'] as const,
  lists: () => [...homeKeys.all, 'list'] as const,
  list: (filters?: string) => [...homeKeys.lists(), { filters }] as const,
  details: () => [...homeKeys.all, 'detail'] as const,
  detail: (id: string) => [...homeKeys.details(), id] as const,
  bySlug: (slug: string) => [...homeKeys.all, 'slug', slug] as const,
};

// API Functions
export const homeApi = {
  // Get all home entries
  getAll: async (): Promise<HomeData[]> => {
    const response = await fetch('/api/home');
    if (!response.ok) {
      throw new Error('Failed to fetch home entries');
    }
    const result: ApiResponse<HomeData[]> = await response.json();
    return result.data;
  },

  // Get single home entry by ID
  getById: async (id: string): Promise<HomeData> => {
    const response = await fetch(`/api/home?id=${id}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch home entry with id: ${id}`);
    }
    const result: ApiResponse<HomeData> = await response.json();
    return result.data;
  },

  // Get home entry by slug
  getBySlug: async (slug: string): Promise<HomeData> => {
    const response = await fetch(`/api/home?slug=${encodeURIComponent(slug)}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch home entry with slug: ${slug}`);
    }
    const result: ApiResponse<HomeData> = await response.json();
    return result.data;
  },

  // Create new home entry
  create: async (data: CreateHomeData): Promise<HomeData> => {
    const response = await fetch('/api/home', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to create home entry');
    }
    const result: ApiResponse<HomeData> = await response.json();
    return result.data;
  },

  // Update existing home entry
  update: async (id: string, data: UpdateHomeData): Promise<HomeData> => {
    const response = await fetch(`/api/home?id=${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to update home entry with id: ${id}`);
    }
    const result: ApiResponse<HomeData> = await response.json();
    return result.data;
  },

  // Delete home entry
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/home?id=${id}`, { 
      method: 'DELETE' 
    });
    if (!response.ok) {
      throw new Error(`Failed to delete home entry with id: ${id}`);
    }
  }
};