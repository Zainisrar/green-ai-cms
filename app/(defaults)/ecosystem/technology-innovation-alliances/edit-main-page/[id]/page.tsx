'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemTechnologyInnovationAlliancesApi } from '@/lib/api/ecosystemTechnologyInnovationAlliances';
import type { EcosystemTechnologyInnovationAlliances, TechnologyInnovationAlliancesMainPage } from '@/db/schema';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function EditMainPageTechnologyInnovationAlliancesPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EcosystemTechnologyInnovationAlliances | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const [mainPage, setMainPage] = useState<TechnologyInnovationAlliancesMainPage>({
        title: '',
        subHeadline: '',
        description: {
            text: '',
            highlighted: ''
        },
        quote: [{
            text: '',
            highlighted: ''
        }],
        cta: [{
            text: '',
            href: ''
        }]
    });

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
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemTechnologyInnovationAlliancesApi.getById(id);
            setData(result);
            setMainPage(result.mainPage);
            
            // Initialize CTA link types
            const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
            result.mainPage.cta?.forEach((_: any, index: number) => {
                initialLinkTypes[index] = 'navigation';
            });
            setCtaLinkTypes(initialLinkTypes);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await ecosystemTechnologyInnovationAlliancesApi.update(id, {
                mainPage
            });
            router.push('/ecosystem/technology-innovation-alliances');
        } catch (err) {
            setError('Failed to update main page');
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    const addQuote = () => {
        setMainPage(prev => ({
            ...prev,
            quote: [...prev.quote, { text: '', highlighted: '' }]
        }));
    };

    const removeQuote = (index: number) => {
        setMainPage(prev => ({
            ...prev,
            quote: prev.quote.filter((_, i) => i !== index)
        }));
    };

    const addCTA = () => {
        const newIndex = mainPage.cta.length;
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setMainPage(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
    };

    const removeCTA = (index: number) => {
        setMainPage(prev => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index)
        }));
        // Re-index link types
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

    if (error && !data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Edit Main Page - Technology Innovation Alliances
                </h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Main Page Content</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={mainPage.title}
                                onChange={(e) => setMainPage(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sub Headline *
                            </label>
                            <input
                                type="text"
                                value={mainPage.subHeadline}
                                onChange={(e) => setMainPage(prev => ({ ...prev, subHeadline: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description Text *
                            </label>
                            <textarea
                                value={mainPage.description.text}
                                onChange={(e) => setMainPage(prev => ({
                                    ...prev,
                                    description: { ...prev.description, text: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description Highlighted
                            </label>
                            <textarea
                                value={mainPage.description.highlighted}
                                onChange={(e) => setMainPage(prev => ({
                                    ...prev,
                                    description: { ...prev.description, highlighted: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Quotes Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Quotes
                            </label>
                            <button
                                type="button"
                                onClick={addQuote}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                                Add Quote
                            </button>
                        </div>
                        
                        {mainPage.quote.map((quote, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium text-gray-700">Quote {index + 1}</h4>
                                    {mainPage.quote.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuote(index)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Quote Text
                                        </label>
                                        <textarea
                                            value={quote.text}
                                            onChange={(e) => {
                                                const newQuotes = [...mainPage.quote];
                                                newQuotes[index].text = e.target.value;
                                                setMainPage(prev => ({ ...prev, quote: newQuotes }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Highlighted Text
                                        </label>
                                        <textarea
                                            value={quote.highlighted}
                                            onChange={(e) => {
                                                const newQuotes = [...mainPage.quote];
                                                newQuotes[index].highlighted = e.target.value;
                                                setMainPage(prev => ({ ...prev, quote: newQuotes }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTAs Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Call to Actions
                            </label>
                            <button
                                type="button"
                                onClick={addCTA}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                                Add CTA
                            </button>
                        </div>
                        
                        {mainPage.cta.map((cta, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium text-gray-700">CTA {index + 1}</h4>
                                    {mainPage.cta.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCTA(index)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            CTA Text
                                        </label>
                                        <input
                                            type="text"
                                            value={cta.text}
                                            onChange={(e) => {
                                                const newCTAs = [...mainPage.cta];
                                                newCTAs[index].text = e.target.value;
                                                setMainPage(prev => ({ ...prev, cta: newCTAs }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Type</label>
                                        <div className="flex gap-4 mb-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`linkType-${index}`}
                                                    checked={ctaLinkTypes[index] === 'navigation'}
                                                    onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'navigation' }))}
                                                    className="form-radio"
                                                />
                                                <span className="text-xs">Navigation Item</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`linkType-${index}`}
                                                    checked={ctaLinkTypes[index] === 'manual'}
                                                    onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'manual' }))}
                                                    className="form-radio"
                                                />
                                                <span className="text-xs">Manual URL</span>
                                            </label>
                                        </div>

                                        {ctaLinkTypes[index] === 'navigation' ? (
                                            <select
                                                value={cta.href}
                                                onChange={(e) => {
                                                    const newCTAs = [...mainPage.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setMainPage(prev => ({ ...prev, cta: newCTAs }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Navigation Item</option>
                                                {allNavItems.map((item: any) => (
                                                    <option key={item.id} value={item.slug || item.href}>
                                                        {item.displayName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={cta.href}
                                                onChange={(e) => {
                                                    const newCTAs = [...mainPage.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setMainPage(prev => ({ ...prev, cta: newCTAs }));
                                                }}
                                                placeholder="Enter URL (e.g., /about or https://example.com)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
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
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}