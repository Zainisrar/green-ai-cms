// Navigation API types
export interface NavItem {
  id: number;
  name: string;
  slug: string;
  top?: boolean;
  accessor?: string;
  accesor?: string; // Legacy field support
  image?: {
    src: string;
    alt: string;
  };
  text?: {
    description: string;
    highlighted: string;
  };
  children?: NavItem[];
}

export interface CreateNavigationData {
  name: string;
  slug: string;
  top?: boolean;
  text_description?: string;
  text_highlighted?: string;
  image?: string; // JSON string of image object
}

export interface UpdateNavigationData extends CreateNavigationData {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Query Keys
export const navigationKeys = {
  all: ['navigation'] as const,
  lists: () => [...navigationKeys.all, 'list'] as const,
  list: (filters?: string) => [...navigationKeys.lists(), { filters }] as const,
  details: () => [...navigationKeys.all, 'detail'] as const,
  detail: (id: string) => [...navigationKeys.details(), id] as const,
};

// API Functions
export const navigationApi = {
  // Get all navigation items
  getAll: async (): Promise<NavItem[]> => {
    const response = await fetch('/api/navigation');
    if (!response.ok) {
      throw new Error('Failed to fetch navigation items');
    }
    const result: ApiResponse<NavItem[]> = await response.json();
    return result.data;
  },

  // Get single navigation item by ID
  getById: async (id: string): Promise<NavItem> => {
    const response = await fetch(`/api/navigation?id=${id}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch navigation item with id: ${id}`);
    }
    const result: ApiResponse<NavItem> = await response.json();
    return result.data;
  },

  // Create new navigation item
  create: async (data: CreateNavigationData): Promise<NavItem> => {
    const response = await fetch('/api/navigation', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to create navigation item');
    }
    const result: ApiResponse<NavItem> = await response.json();
    return result.data;
  },

  // Update existing navigation item
  update: async (id: string, data: UpdateNavigationData): Promise<NavItem> => {
    const response = await fetch(`/api/navigation?id=${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to update navigation item with id: ${id}`);
    }
    const result: ApiResponse<NavItem> = await response.json();
    return result.data;
  },

  // Delete navigation item
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/navigation?id=${id}`, { 
      method: 'DELETE' 
    });
    if (!response.ok) {
      throw new Error(`Failed to delete navigation item with id: ${id}`);
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
    return result.data;
  }
};