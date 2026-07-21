'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemCommunityImpactLoopApi } from '@/lib/api/ecosystemCommunityImpactLoop';
import type { EcosystemCommunityImpactLoopInsert } from '@/db/schema';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function CreateCommunityImpactLoopPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const [formData, setFormData] = useState<EcosystemCommunityImpactLoopInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: '',
            quote: {
                text: '',
                highlighted: ''
            },
            cta: []
        },
        greenCommunityImpactLoop: {
            title: '',
            description: {
                text1: '',
                text2: ''
            },
            keys: []
        },
        howLoopWorks: {
            title: '',
            items: []
        },
        measuredImpact: {
            title: '',
            items: [],
            quote: {
                text: '',
                highlighted: ''
            }
        },
        joinTheLoop: {
            title: '',
            img: {
                src: '',
                alt: ''
            },
            quote: {
                text: '',
                highlighted: ''
            }
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await ecosystemCommunityImpactLoopApi.create(formData);
            router.push('/ecosystem/community-impact-loop');
        } catch (err) {
            setError('Failed to create community impact loop data');
            console.error('Error creating data:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateMainPage = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                [field]: value
            }
        }));
    };

    const addCTA = () => {
        const newIndex = formData.mainPage.cta.length;
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: [...prev.mainPage.cta, { text: '', href: '' }]
            }
        }));
    };

    const updateCTA = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: prev.mainPage.cta.map((cta, i) => 
                    i === index ? { ...cta, [field]: value } : cta
                )
            }
        }));
    };

    const removeCTA = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: prev.mainPage.cta.filter((_, i) => i !== index)
            }
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

    const updateGreenCommunityImpactLoop = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            greenCommunityImpactLoop: {
                ...prev.greenCommunityImpactLoop,
                [field]: value
            }
        }));
    };

    const updateHowLoopWorks = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            howLoopWorks: {
                ...prev.howLoopWorks,
                [field]: value
            }
        }));
    };

    const updateMeasuredImpact = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            measuredImpact: {
                ...prev.measuredImpact,
                [field]: value
            }
        }));
    };

    const updateJoinTheLoop = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            joinTheLoop: {
                ...prev.joinTheLoop,
                [field]: value
            }
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create Community Impact Loop</h1>
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Page Section */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-600">Main Page</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.mainPage.title}
                                onChange={(e) => updateMainPage('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.mainPage.subHeadline}
                                onChange={(e) => updateMainPage('subHeadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.mainPage.description}
                                onChange={(e) => updateMainPage('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                            <input
                                type="text"
                                value={formData.mainPage.quote.text}
                                onChange={(e) => updateMainPage('quote', { ...formData.mainPage.quote, text: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                            <input
                                type="text"
                                value={formData.mainPage.quote.highlighted}
                                onChange={(e) => updateMainPage('quote', { ...formData.mainPage.quote, highlighted: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-6">
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
                        {formData.mainPage.cta.map((cta, index) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">CTA {index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeCTA(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                
                                <div>
                                    <input
                                        type="text"
                                        placeholder="CTA Text"
                                        value={cta.text}
                                        onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`linkType-${index}`}
                                                checked={ctaLinkTypes[index] === 'navigation'}
                                                onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'navigation' }))}
                                                className="form-radio"
                                            />
                                            <span className="text-sm">Navigation Item</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`linkType-${index}`}
                                                checked={ctaLinkTypes[index] === 'manual'}
                                                onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'manual' }))}
                                                className="form-radio"
                                            />
                                            <span className="text-sm">Manual URL</span>
                                        </label>
                                    </div>

                                    {ctaLinkTypes[index] === 'navigation' ? (
                                        <select
                                            value={cta.href}
                                            onChange={(e) => updateCTA(index, 'href', e.target.value)}
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
                                            placeholder="Enter URL (e.g., /about or https://example.com)"
                                            value={cta.href}
                                            onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Green Community Impact Loop Section */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-green-600">Green Community Impact Loop</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.greenCommunityImpactLoop.title}
                                onChange={(e) => updateGreenCommunityImpactLoop('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description Text 1</label>
                            <textarea
                                value={formData.greenCommunityImpactLoop.description.text1}
                                onChange={(e) => updateGreenCommunityImpactLoop('description', { ...formData.greenCommunityImpactLoop.description, text1: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description Text 2</label>
                            <textarea
                                value={formData.greenCommunityImpactLoop.description.text2}
                                onChange={(e) => updateGreenCommunityImpactLoop('description', { ...formData.greenCommunityImpactLoop.description, text2: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Keys (one per line)</label>
                            <textarea
                                value={formData.greenCommunityImpactLoop.keys.join('\n')}
                                onChange={(e) => updateGreenCommunityImpactLoop('keys', e.target.value.split('\n').filter(key => key.trim()))}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter keys, one per line"
                            />
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
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}