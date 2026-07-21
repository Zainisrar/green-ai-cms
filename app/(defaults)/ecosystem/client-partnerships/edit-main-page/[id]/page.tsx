'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EcosystemClientPartnerships } from '@/db/schema';
import { ecosystemClientPartnershipsApi } from '@/lib/api/ecosystemClientPartnerships';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function EditClientPartnershipsMainPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<EcosystemClientPartnerships | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const flattenNavItems = (items: any[], parent = ''): any[] => {
        let result: any[] = [];
        items.forEach(item => {
            const displayName = parent ? `${parent} > ${item.name}` : item.name;
            result.push({ ...item, displayName });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenNavItems(item.children, displayName));
            }
        });
        return result;
    };

    const allNavItems = navigationItems ? flattenNavItems(navigationItems) : [];

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemClientPartnershipsApi.getById(id);
            setData(result);
            
            const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
            result.mainPage.cta?.forEach((_: any, index: number) => {
                initialLinkTypes[index] = 'navigation';
            });
            setCtaLinkTypes(initialLinkTypes);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load client partnerships data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setSaving(true);
        try {
            await ecosystemClientPartnershipsApi.update(id, {
                mainPage: data.mainPage
            });
            router.push('/ecosystem/client-partnerships');
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Failed to update client partnerships data');
        } finally {
            setSaving(false);
        }
    };

    const updateMainPage = (field: string, value: any) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                [field]: value
            }
        } : null);
    };

    const addCTA = () => {
        if (!data) return;
        const newIndex = data.mainPage.cta.length;
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: [...prev.mainPage.cta, { text: '', href: '' }]
            }
        } : null);
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
    };

    const updateCTA = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: prev.mainPage.cta.map((cta, i) => 
                    i === index ? { ...cta, [field]: value } : cta
                )
            }
        } : null);
    };

    const removeCTA = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: prev.mainPage.cta.filter((_, i) => i !== index)
            }
        } : null);
        setCtaLinkTypes(prev => {
            const updated = { ...prev };
            delete updated[index];
            const reindexed: { [key: number]: 'navigation' | 'manual' } = {};
            Object.keys(updated).forEach((key) => {
                const numKey = parseInt(key);
                if (numKey > index) {
                    reindexed[numKey - 1] = updated[numKey];
                } else {
                    reindexed[numKey] = updated[numKey];
                }
            });
            return reindexed;
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Data Not Found</h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Client Partnerships - Main Page</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6">Main Page Content</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.mainPage.title}
                                onChange={(e) => updateMainPage('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sub Headline
                            </label>
                            <input
                                type="text"
                                value={data.mainPage.subHeadline}
                                onChange={(e) => updateMainPage('subHeadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.mainPage.description}
                                onChange={(e) => updateMainPage('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quote 1 - Text 1
                                </label>
                                <textarea
                                    value={data.mainPage.quote1.text1}
                                    onChange={(e) => updateMainPage('quote1', { ...data.mainPage.quote1, text1: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quote 1 - Text 2
                                </label>
                                <textarea
                                    value={data.mainPage.quote1.text2}
                                    onChange={(e) => updateMainPage('quote1', { ...data.mainPage.quote1, text2: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quote 2
                            </label>
                            <textarea
                                value={data.mainPage.quote2}
                                onChange={(e) => updateMainPage('quote2', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* CTA Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Call to Actions
                                </label>
                                <button
                                    type="button"
                                    onClick={addCTA}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Add CTA
                                </button>
                            </div>
                            {data.mainPage.cta.map((cta, index) => (
                                <div key={index} className="p-4 border rounded-lg mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-gray-600">CTA {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCTA(index)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="CTA Text"
                                                value={cta.text}
                                                onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        checked={ctaLinkTypes[index] === 'navigation'}
                                                        onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'navigation' }))}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-gray-700">Navigation Item</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        checked={ctaLinkTypes[index] === 'manual'}
                                                        onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'manual' }))}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-gray-700">Manual Link</span>
                                                </label>
                                            </div>
                                            
                                            {ctaLinkTypes[index] === 'navigation' ? (
                                                <select
                                                    value={cta.href}
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select navigation item</option>
                                                    {allNavItems.map((item) => (
                                                        <option key={item.id} value={item.href}>
                                                            {item.displayName}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    placeholder="CTA Link"
                                                    value={cta.href}
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}