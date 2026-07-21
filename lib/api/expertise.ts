// Expertise API types
export interface ExpertiseImage {
  src: string;
  alt: string;
}

export interface ExpertiseIcon {
  img: ExpertiseImage;
  title: string;
  description: string;
}

export interface ExpertiseCarousel {
  img: ExpertiseImage;
}

export interface ExpertiseKey {
  text: string;
}

export interface ExpertiseData {
  id?: number;
  title: string;
  subtitle: string;
  highlighted: string;
  description: string;
  image: string;
  slug: string; // "/expertise/{title}"
  highlightedTitle: string;
  subtitlePage: string;
  descriptionPage: string;
  icons: ExpertiseIcon[];
  carousel: ExpertiseCarousel[];
  keys: ExpertiseKey[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpertiseData {
  title: string;
  subtitle: string;
  highlighted: string;
  description: string;
  image: string;
  slug: string;
  highlightedTitle: string;
  subtitlePage: string;
  descriptionPage: string;
  icons: ExpertiseIcon[];
  carousel: ExpertiseCarousel[];
  keys: ExpertiseKey[];
}

export interface UpdateExpertiseData extends CreateExpertiseData {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Query Keys
export const expertiseKeys = {
  all: ['expertise'] as const,
  lists: () => [...expertiseKeys.all, 'list'] as const,
  list: (filters?: string) => [...expertiseKeys.lists(), { filters }] as const,
  details: () => [...expertiseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expertiseKeys.details(), id] as const,
  bySlug: (slug: string) => [...expertiseKeys.all, 'slug', slug] as const,
};

// API Functions
export const expertiseApi = {
  // Get all expertise entries
  getAll: async (): Promise<ExpertiseData[]> => {
    const response = await fetch('/api/expertise');
    if (!response.ok) {
      throw new Error('Failed to fetch expertise entries');
    }
    const result: ApiResponse<ExpertiseData[]> = await response.json();
    return result.data;
  },

  // Get single expertise entry by ID
  getById: async (id: string): Promise<ExpertiseData> => {
    const response = await fetch(`/api/expertise?id=${id}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch expertise entry with id: ${id}`);
    }
    const result: ApiResponse<ExpertiseData> = await response.json();
    return result.data;
  },

  // Get expertise entry by slug
  getBySlug: async (slug: string): Promise<ExpertiseData> => {
    const response = await fetch(`/api/expertise?slug=${encodeURIComponent(slug)}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch expertise entry with slug: ${slug}`);
    }
    const result: ApiResponse<ExpertiseData> = await response.json();
    return result.data;
  },

  // Create new expertise entry
  create: async (data: CreateExpertiseData): Promise<ExpertiseData> => {
    const response = await fetch('/api/expertise', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(errorResult.error || 'Failed to create expertise entry');
    }
    const result: ApiResponse<ExpertiseData> = await response.json();
    return result.data;
  },

  // Update existing expertise entry
  update: async (id: string, data: UpdateExpertiseData): Promise<ExpertiseData> => {
    const response = await fetch(`/api/expertise?id=${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to update expertise entry with id: ${id}`);
    }
    const result: ApiResponse<ExpertiseData> = await response.json();
    return result.data;
  },

  // Delete expertise entry
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/expertise?id=${id}`, { 
      method: 'DELETE' 
    });
    if (!response.ok) {
      throw new Error(`Failed to delete expertise entry with id: ${id}`);
    }
  },

  // Upload image
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const result = await response.json();
    return result;
  }
};