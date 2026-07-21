import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface LeadershipPhilosophy {
    title: string;
    description: string;
    keyPoints: string[];
    quote: {
        text: string;
        highlightedText: string;
    };
    qualities: string[];
}

interface TeamMember {
    img: string;
    name: string;
    position: string;
}

interface Designation {
    name: string;
    members: TeamMember[];
}

interface MeetTeam {
    title: string;
    description: string;
    designations: Designation[];
    quote: {
        text: string;
        highlightedText: string;
    };
}

interface CultureAction {
    title: string;
    description: string;
    keypoint: string[];
    quote: string;
    quoteHighlighted: string;
    img: string;
    text: string;
}

interface TeamGreenData {
    id: number;
    mainPage?: any;
    whoWeAreModal?: any;
    ourLeadershipPhilosophy?: LeadershipPhilosophy;
    meetTeam?: MeetTeam;
    ourCultureActionModal?: CultureAction;
    createdAt?: string;
    updatedAt?: string;
}

// Hook to get team green data
export const useTeamGreen = () => {
    return useQuery({
        queryKey: ['teamGreen'],
        queryFn: async (): Promise<TeamGreenData> => {
            const result = await apiClient.get('/api/empower/team-green');
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch team green data');
            }
            return result.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to update leadership philosophy
export const useUpdateLeadershipPhilosophy = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: LeadershipPhilosophy) => {
            // First get current data to get the ID
            const currentResult = await apiClient.get('/api/empower/team-green');
            if (!currentResult.success || !currentResult.data?.id) {
                throw new Error('Failed to get current team data');
            }

            const payload = {
                id: currentResult.data.id,
                ourLeadershipPhilosophy: data
            };

            const result = await apiClient.put('/api/empower/team-green', payload);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update leadership philosophy');
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamGreen'] });
        },
    });
};

// Hook to update meet team
export const useUpdateMeetTeam = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: MeetTeam) => {
            // First get current data to get the ID
            const currentResult = await apiClient.get('/api/empower/team-green');
            if (!currentResult.success || !currentResult.data?.id) {
                throw new Error('Failed to get current team data');
            }

            const payload = {
                id: currentResult.data.id,
                meetTeam: data
            };

            const result = await apiClient.put('/api/empower/team-green', payload);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update meet team');
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamGreen'] });
        },
    });
};

// Hook to update culture action
export const useUpdateCultureAction = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: CultureAction) => {
            // First get current data to get the ID
            const currentResult = await apiClient.get('/api/empower/team-green');
            if (!currentResult.success || !currentResult.data?.id) {
                throw new Error('Failed to get current team data');
            }

            const payload = {
                id: currentResult.data.id,
                ourCultureActionModal: data
            };

            const result = await apiClient.put('/api/empower/team-green', payload);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update culture action');
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teamGreen'] });
        },
    });
};