'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { ecosystemImpactMeasurementESGApi } from '@/lib/api/ecosystemImpactMeasurementESG';
import { EcosystemImpactMeasurementESG, ImpactMeasurementESGMainPage } from '@/db/schema';

export default function EditMainPageEcosystemImpactMeasurementESGPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemImpactMeasurementESG | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const [formData, setFormData] = useState<ImpactMeasurementESGMainPage>({
        title: '',
        subHeadline: '',
        description: {
            text: '',
            highlighted: ''
        },
        quote: {
            text: '',
            highlighted: ''
        },
        cta: []
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemImpactMeasurementESGApi.getById(id);
            setData(result);
            setFormData(result.mainPage);
            
            const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
            result.mainPage.cta?.forEach((_: any, index: number) => {
                initialLinkTypes[index] = 'navigation';
            });
            setCtaLinkTypes(initialLinkTypes);
        } catch (err) {
            setError('Failed to load data');
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
            await ecosystemImpactMeasurementESGApi.update(id, {
                mainPage: formData
            });
            router.push('/ecosystem/impact-measurement-esg');
        } catch (err) {
            setError('Failed to update data');
            console.error('Error updating data:', err);
        } finally {
            setSaving(false);
        }
    };

    const addCTA = () => {
        const newIndex = formData.cta.length;
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setFormData(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
    };

    const removeCTA = (index: number) => {
        setFormData(prev => ({
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Data not found
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-8">
            <div className="max-w-none">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Main Page - Impact Measurement ESG
                    </h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        ← Back
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-none space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Main Page Content</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        title: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sub Headline
                                </label>
                                <input
                                    type="text"
                                    value={formData.subHeadline}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        subHeadline: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description Text
                                </label>
                                <textarea
                                    value={formData.description.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: { ...prev.description, text: e.target.value }
                                    }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description Highlighted
                                </label>
                                <input
                                    type="text"
                                    value={formData.description.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: { ...prev.description, highlighted: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quote Text
                                </label>
                                <textarea
                                    value={formData.quote.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        quote: { ...prev.quote, text: e.target.value }
                                    }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quote Highlighted
                                </label>
                                <input
                                    type="text"
                                    value={formData.quote.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        quote: { ...prev.quote, highlighted: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
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
                            {formData.cta.map((cta, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium">CTA {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeCTA(index)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
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
                                                onChange={(e) => {
                                                    const newCTA = [...formData.cta];
                                                    newCTA[index].text = e.target.value;
                                                    setFormData(prev => ({ ...prev, cta: newCTA }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                    onChange={(e) => {
                                                        const newCTA = [...formData.cta];
                                                        newCTA[index].href = e.target.value;
                                                        setFormData(prev => ({ ...prev, cta: newCTA }));
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                    placeholder="CTA Href"
                                                    value={cta.href}
                                                    onChange={(e) => {
                                                        const newCTA = [...formData.cta];
                                                        newCTA[index].href = e.target.value;
                                                        setFormData(prev => ({ ...prev, cta: newCTA }));
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
                        >
                            {saving ? '💾 Saving...' : '✅ Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}