import { Energy, EnergyInsert } from '@/db/schema';

export interface EnergyService {
  title: string;
  description: string;
  shortDescription: string;
  keys: { text: string }[];
}

export interface EnergyCTA {
  text: string;
  href: string;
}

export interface EnergyData {
  service1: EnergyService;
  service2: EnergyService;
  service3: EnergyService;
  service4: EnergyService;
  headline: string;
  subheadline: string;
  cta: EnergyCTA;
}

export interface EnergyUpdateData extends EnergyData {
  id: string;
}

const API_BASE_URL = '/api/energy';

export const energyApi = {
  // Get all energy entries
  getAll: async (): Promise<Energy[]> => {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch energy entries');
    }
    
    return result.data;
  },

  // Get energy entry by ID
  getById: async (id: string): Promise<Energy> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch energy entry');
    }
    
    return result.data;
  },

  // Create new energy entry
  create: async (data: EnergyData): Promise<Energy> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create energy entry');
    }
    
    return result.data;
  },

  // Update energy entry
  update: async (id: string, data: EnergyData): Promise<Energy> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update energy entry');
    }
    
    return result.data;
  },

  // Delete energy entry
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete energy entry');
    }
  },
};

// Query keys for React Query
export const energyKeys = {
  all: ['energy'] as const,
  lists: () => [...energyKeys.all, 'list'] as const,
  list: (filters: string) => [...energyKeys.lists(), { filters }] as const,
  details: () => [...energyKeys.all, 'detail'] as const,
  detail: (id: string) => [...energyKeys.details(), id] as const,
};