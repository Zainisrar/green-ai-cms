'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemIndustryAffiliationsCertificationsApi } from '@/lib/api/ecosystemIndustryAffiliationsCertifications';
import { EcosystemIndustryAffiliationsCertifications } from '@/db/schema';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function EditMainPageIndustryAffiliationsCertificationsPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemIndustryAffiliationsCertifications | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            const result = await ecosystemIndustryAffiliationsCertificationsApi.getById(id);
            setData(result);
            
            const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
            result.mainPage.cta?.forEach((_: any, index: number) => {
                initialLinkTypes[index] = 'navigation';
            });
            setCtaLinkTypes(initialLinkTypes);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setSaving(true);
        setError(null);

        try {
            await ecosystemIndustryAffiliationsCertificationsApi.update(id, {
                mainPage: data.mainPage
            });
            router.push('/ecosystem/industry-affiliations-certifications');
        } catch (err: any) {
            console.error('Error updating data:', err);
            setError(err.response?.data?.message || 'Failed to update data');
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

    const updateQuote = (index: number, field: string, value: string) => {
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
        const newLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
        Object.keys(ctaLinkTypes).forEach(key => {
            const idx = parseInt(key);
            if (idx < index) {
                newLinkTypes[idx] = ctaLinkTypes[idx];
            } else if (idx > index) {
                newLinkTypes[idx - 1] = ctaLinkTypes[idx];
            }
        });
        setCtaLinkTypes(newLinkTypes);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error: {error || 'Data not found'}</p>
                    <button 
                        onClick={() => router.back()}
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className=" px-4 py-8">
            <div className="">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Edit Main Page - Industry Affiliations & Certifications</h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Main Page Content</h2>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.mainPage.description.text}
                                onChange={(e) => updateMainPage('description', { text: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Quotes */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
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
                                <div key={index} className="border border-gray-300 rounded p-4 mb-2">
                                    <div className="grid md:grid-cols-2 gap-4 mb-2">
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
                                    <button
                                        type="button"
                                        onClick={() => removeQuote(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
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
                                <div key={index} className="border border-gray-300 rounded p-4 mb-2">
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link Type
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`cta-type-${index}`}
                                                    value="navigation"
                                                    checked={ctaLinkTypes[index] === 'navigation'}
                                                    onChange={(e) => {
                                                        setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'navigation' });
                                                    }}
                                                    className="mr-2"
                                                />
                                                Navigation
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`cta-type-${index}`}
                                                    value="manual"
                                                    checked={ctaLinkTypes[index] === 'manual'}
                                                    onChange={(e) => {
                                                        setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'manual' });
                                                    }}
                                                    className="mr-2"
                                                />
                                                Manual
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 mb-2">
                                        <input
                                            type="text"
                                            placeholder="CTA text"
                                            value={cta.text}
                                            onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {ctaLinkTypes[index] === 'navigation' ? (
                                            <select
                                                value={cta.href}
                                                onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select navigation item</option>
                                                {allNavItems.map((item) => (
                                                    <option key={item.href} value={item.href}>
                                                        {item.label}
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
                                    <button
                                        type="button"
                                        onClick={() => removeCTA(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
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
        </div>
    );
}