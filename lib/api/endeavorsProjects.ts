import { EndeavorsProject, EndeavorsProjectInsert } from '@/db/schema';

export interface ProjectFormData {
    title: string;
    slug?: string;
    featuredImg?: string;
    numberofsystems?: string;
    noofdays?: string;
    totalgeneration?: string;
    battery?: string;
    coalA?: string;
    emissionreduction?: string;
    treesplanted?: string;
    capacity?: string;
    todateproduct?: string;
    consumption?: string;
    totalenergydaily?: string;
}

export const fetchEndeavorsProjects = async (): Promise<EndeavorsProject[]> => {
    const response = await fetch('/api/endeavors/projects');
    if (!response.ok) {
        throw new Error('Failed to fetch endeavors projects');
    }
    return response.json();
};

export const createEndeavorsProject = async (data: ProjectFormData): Promise<EndeavorsProject> => {
    const response = await fetch('/api/endeavors/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
    }

    return response.json();
};

export const updateEndeavorsProject = async (id: number, data: ProjectFormData): Promise<EndeavorsProject> => {
    const response = await fetch('/api/endeavors/projects', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
    }

    return response.json();
};

export const deleteEndeavorsProject = async (id: number): Promise<void> => {
    const response = await fetch(`/api/endeavors/projects?id=${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
    }
};