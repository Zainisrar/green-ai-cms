import { EndeavorsFlagshipProject, EndeavorsFlagshipProjectInsert } from '@/db/schema';

export interface FlagshipProjectFormData {
    title: string;
    subheadline: string;
    key: {
        title: string;
        subtitle: string;
    };
    icons: {
        img: {
            src: string;
            alt: string;
        };
        title: string;
        description: string;
    }[];
    description: string;
    footer: {
        title: string;
        subheadline: string;
    };
    cta: {
        text: string;
        href: string;
    }[];
}

export const fetchEndeavorsFlagshipProject = async (): Promise<EndeavorsFlagshipProject | null> => {
    // Add timestamp to force cache busting
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/endeavors/flagship-projects/get?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch flagship project');
    }
    return response.json();
};

export const updateEndeavorsFlagshipProject = async (data: FlagshipProjectFormData): Promise<EndeavorsFlagshipProject> => {
    const response = await fetch('/api/endeavors/flagship-projects/update', {
        method: 'PUT',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update flagship project');
    }

    return response.json();
};