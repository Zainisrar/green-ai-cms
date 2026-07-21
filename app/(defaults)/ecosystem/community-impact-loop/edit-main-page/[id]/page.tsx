'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { ecosystemCommunityImpactLoopApi } from '@/lib/api/ecosystemCommunityImpactLoop';
import type { EcosystemCommunityImpactLoop, CommunityImpactLoopMainPage, CommunityImpactLoopCTA } from '@/db/schema';

interface Props {
    params: { id: string };
}

export default function EditMainPageCommunityImpactLoop({ params }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EcosystemCommunityImpactLoop | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll()
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

    const [mainPage, setMainPage] = useState<CommunityImpactLoopMainPage>({
        title: '',
        subHeadline: '',
        description: '',
        quote: {
            text: '',
            highlighted: ''
        },
        cta: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemCommunityImpactLoopApi.getById(parseInt(params.id));
            console.log('Fetched data:', result);
            setData(result);
            
            // Handle data structure mismatch
            const apiData = result.mainPage;
            console.log('Main page data:', apiData);
            
            // Handle description - it could be a string or an object with text/highlighted
            let description = '';
            if (typeof apiData.description === 'string') {
                description = apiData.description;
            } else if (apiData.description && typeof apiData.description === 'object') {
                const desc = apiData.description as any;
                description = desc.text || '';
            }
            
            // Handle quote - it could be an object or an array
            let quote = { text: '', highlighted: '' };
            if (apiData.quote) {
                if (Array.isArray(apiData.quote) && apiData.quote.length > 0) {
                    quote = {
                        text: apiData.quote[0].text || '',
                        highlighted: apiData.quote[0].highlighted || ''
                    };
                } else if (typeof apiData.quote === 'object' && !Array.isArray(apiData.quote)) {
                    quote = {
                        text: (apiData.quote as any).text || '',
                        highlighted: (apiData.quote as any).highlighted || ''
                    };
                }
            }
            
            const transformedData = {
                title: apiData.title || '',
                subHeadline: apiData.subHeadline || '',
                description: description,
                quote: quote,
                cta: apiData.cta || []
            };
            
            console.log('Transformed main page data:', transformedData);
            setMainPage(transformedData);
            
            const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
            transformedData.cta?.forEach((_: any, index: number) => {
                initialLinkTypes[index] = 'navigation';
            });
            setCtaLinkTypes(initialLinkTypes);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            console.log('Submitting main page data:', mainPage);
            const result = await ecosystemCommunityImpactLoopApi.update(parseInt(params.id), {
                mainPage
            });
            console.log('Update result:', result);
            router.push('/ecosystem/community-impact-loop');
        } catch (err) {
            setError('Failed to update main page');
            console.error('Error updating data:', err);
        } finally {
            setSaving(false);
        }
    };

    const addCTA = () => {
        const newIndex = mainPage.cta.length;
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setMainPage(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
    };

    const updateCTA = (index: number, field: keyof CommunityImpactLoopCTA, value: string) => {
        setMainPage(prev => ({
            ...prev,
            cta: prev.cta.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeCTA = (index: number) => {
        setMainPage(prev => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index)
        }));
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

    if (error && !data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Main Page - Community Impact Loop</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-600">Main Page Content</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={mainPage.title}
                                onChange={(e) => setMainPage(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={mainPage.subHeadline}
                                onChange={(e) => setMainPage(prev => ({ ...prev, subHeadline: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={mainPage.description}
                                onChange={(e) => setMainPage(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                            <input
                                type="text"
                                value={mainPage.quote.text}
                                onChange={(e) => setMainPage(prev => ({ 
                                    ...prev, 
                                    quote: { ...prev.quote, text: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                            <input
                                type="text"
                                value={mainPage.quote.highlighted}
                                onChange={(e) => setMainPage(prev => ({ 
                                    ...prev, 
                                    quote: { ...prev.quote, highlighted: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Call to Actions</h3>
                            <button
                                type="button"
                                onClick={addCTA}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Add CTA
                            </button>
                        </div>
                        
                        {mainPage.cta.map((cta, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">CTA {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeCTA(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                                        <input
                                            type="text"
                                            value={cta.text}
                                            onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
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
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Href</label>
                                                <input
                                                    type="text"
                                                    value={cta.href}
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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