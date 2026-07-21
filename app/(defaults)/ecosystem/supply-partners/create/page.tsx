'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemSupplyPartnersInsert } from '@/db/schema';
import { navigationApi } from '@/lib/api/navigation';
import { navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function CreateEcosystemSupplyPartnersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    // Fetch navigation items
    const { data: navData } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll()
    });

    // Flatten navigation items for dropdown
    const flattenNavItems = (items: any[], prefix = ''): { label: string; href: string }[] => {
        let result: { label: string; href: string }[] = [];
        items.forEach(item => {
            const label = prefix ? `${prefix} > ${item.title}` : item.title;
            result.push({ label, href: item.href });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenNavItems(item.children, label));
            }
        });
        return result;
    };

    const allNavItems = navData ? flattenNavItems(navData) : [];

    const [formData, setFormData] = useState<EcosystemSupplyPartnersInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote: { text: '', highlighted: '' },
            cta: [],
            partnerSpotlight: { icons: [], text: '' },
        },
        globalSourcingStrategy: {
            title: '',
            headline: '',
            description: '',
            keyPoints: [],
        },
        whatWeProcure: {
            title: '',
            item: [],
        },
        howBecomeGreenSupplier: {
            title: '',
            subHeadline: '',
            item: [],
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Add your API call here
            // await ecosystemSupplyPartnersApi.create(formData);
            router.push('/ecosystem/supply-partners');
        } catch (err) {
            setError('Failed to create supply partners data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Create Supply Partners</h1>
                <button onClick={() => router.back()} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Back
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Page Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Main Page</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.mainPage.title}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        mainPage: { ...prev.mainPage, title: e.target.value },
                                    }))
                                }
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.mainPage.subHeadline}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        mainPage: { ...prev.mainPage, subHeadline: e.target.value },
                                    }))
                                }
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        {/* Add more form fields as needed */}
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Supply Partners'}
                    </button>
                </div>
            </form>
        </div>
    );
}
