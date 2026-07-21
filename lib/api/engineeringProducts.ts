import { EngineeringProduct, EngineeringProductInsert } from '@/db/schema';

export interface ProductFormData {
    title: string;
    slug?: string;
    description: string;
    imgs: { src: string; alt: string }[];
    ctaButton: { text: string; href: string };
    keys: { icon: { src: string; alt: string }; title: string; description: string }[];
}

export const fetchEngineeringProducts = async (): Promise<EngineeringProduct[]> => {
    const response = await fetch('/api/engineering/products');
    if (!response.ok) {
        throw new Error('Failed to fetch engineering products');
    }
    return response.json();
};

export const createEngineeringProduct = async (data: ProductFormData): Promise<EngineeringProduct> => {
    const response = await fetch('/api/engineering/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
    }

    return response.json();
};

export const updateEngineeringProduct = async (id: number, data: ProductFormData): Promise<EngineeringProduct> => {
    const response = await fetch('/api/engineering/products', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
    }

    return response.json();
};

export const deleteEngineeringProduct = async (id: number): Promise<void> => {
    const response = await fetch(`/api/engineering/products?id=${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
    }
};