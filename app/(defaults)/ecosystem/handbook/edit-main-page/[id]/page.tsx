'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { ecosystemHandbookApi } from '@/lib/api/ecosystemHandbook';
import type { EcosystemHandbook } from '@/db/schema';

export default function EditEcosystemHandbookMainPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [data, setData] = useState<EcosystemHandbook | null>(null);
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

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setFetchLoading(true);
            const result = await ecosystemHandbookApi.getById(id);
            setData(result);
        } catch (error) {
            console.error('Error fetching ecosystem handbook:', error);
            alert('Failed to load ecosystem handbook data');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setLoading(true);
        try {
            await ecosystemHandbookApi.update(id, {
                mainPage: data.mainPage
            });
            router.push('/ecosystem/handbook');
        } catch (error) {
            console.error('Error updating ecosystem handbook:', error);
            alert('Failed to update ecosystem handbook');
        } finally {
            setLoading(false);
        }
    };

    const addQuote = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: [...prev.mainPage.quote, { text: '', highlighted: '' }]
            }
        } : null);
    };

    const removeQuote = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: prev.mainPage.quote.filter((_, i) => i !== index)
            }
        } : null);
    };

    const updateQuote = (index: number, field: 'text' | 'highlighted', value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: prev.mainPage.quote.map((quote, i) => 
                    i === index ? { ...quote, [field]: value } : quote
                )
            }
        } : null);
    };

    const addCTA = () => {
        if (!data) return;
        const newIndex = data.mainPage.cta.length;
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setData(prev => prev ? {
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: [...prev.mainPage.cta, { text: '', href: '' }]
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
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
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

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">Ecosystem handbook not found</div>
            </div>
        );
    }

    return (
        <div className=" px-4 py-8">
            <div className="">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Main Page - Ecosystem Handbook</h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Main Page Content</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.mainPage.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        mainPage: { ...prev.mainPage, title: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sub Headline *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.mainPage.subHeadline}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        mainPage: { ...prev.mainPage, subHeadline: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={data.mainPage.description}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        mainPage: { ...prev.mainPage, description: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Quotes */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Quotes
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addQuote}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Add Quote
                                    </button>
                                </div>
                                {data.mainPage.quote.map((quote, index) => (
                                    <div key={index} className="border border-gray-200 rounded p-4 mb-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600">Quote {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeQuote(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Quote text"
                                                value={quote.text}
                                                onChange={(e) => updateQuote(index, 'text', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Highlighted text"
                                                value={quote.highlighted}
                                                onChange={(e) => updateQuote(index, 'highlighted', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
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
                                    <div key={index} className="border border-gray-200 rounded p-4 mb-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600">CTA {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCTA(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="CTA text"
                                                value={cta.text}
                                                onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            
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
                                                        placeholder="CTA link"
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
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Main Page'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}