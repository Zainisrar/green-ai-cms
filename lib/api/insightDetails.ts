// Insight Details API types
export interface NavItem {
  name: string;
  link: string;
}

export interface NavigationProps {
  items: NavItem[];
}

export interface Keypoint {
  icon: string;
  text: string;
}

export interface InsightDetailData {
  id?: number;
  bgImg: string; // Regular image path
  backgroundImg?: string; // CSS background class
  navigation: NavigationProps; // navigation object
  title: string;
  subheadline: string; // subheadline
  description: string; // description
  name1: string;
  name2: string;
  cardTitle: string;
  keypoints: Keypoint[]; // keypoints array
  slug?: string; // URL slug (optional)
  imageDirection?: 'left' | 'right'; // Image direction (optional)
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInsightDetailData {
  bgImg: string;
  backgroundImg?: string;
  navigation: NavigationProps;
  title: string;
  subheadline: string;
  description: string;
  name1: string;
  name2: string;
  cardTitle: string;
  keypoints: Keypoint[];
  slug?: string;
  imageDirection?: 'left' | 'right';
}

export interface UpdateInsightDetailData extends CreateInsightDetailData {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Query Keys
export const insightDetailKeys = {
  all: ['insightDetails'] as const,
  lists: () => [...insightDetailKeys.all, 'list'] as const,
  list: (filters?: string) => [...insightDetailKeys.lists(), { filters }] as const,
  details: () => [...insightDetailKeys.all, 'detail'] as const,
  detail: (id: string) => [...insightDetailKeys.details(), id] as const,
};

// API Functions
export const insightDetailApi = {
  // Get all insight details
  getAll: async (): Promise<InsightDetailData[]> => {
    const response = await fetch('/api/insight-details');
    if (!response.ok) {
      throw new Error('Failed to fetch insight details');
    }
    const result: ApiResponse<InsightDetailData[]> = await response.json();
    return result.data;
  },

  // Get single insight detail by ID
  getById: async (id: string): Promise<InsightDetailData> => {
    const response = await fetch(`/api/insight-details?id=${id}`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch insight detail with id: ${id}`);
    }
    const result: ApiResponse<InsightDetailData> = await response.json();
    return result.data;
  },

  // Create new insight detail
  create: async (data: CreateInsightDetailData): Promise<InsightDetailData> => {
    const response = await fetch('/api/insight-details', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to create insight detail');
    }
    const result: ApiResponse<InsightDetailData> = await response.json();
    return result.data;
  },

  // Update existing insight detail
  update: async (id: string, data: UpdateInsightDetailData): Promise<InsightDetailData> => {
    const response = await fetch(`/api/insight-details?id=${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to update insight detail with id: ${id}`);
    }
    const result: ApiResponse<InsightDetailData> = await response.json();
    return result.data;
  },

  // Delete insight detail
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/insight-details?id=${id}`, { 
      method: 'DELETE' 
    });
    if (!response.ok) {
      throw new Error(`Failed to delete insight detail with id: ${id}`);
    }
  }
};