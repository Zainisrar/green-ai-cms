'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemCollaborationInnovationInsert } from '@/db/schema';
import { ecosystemCollaborationInnovationApi } from '@/lib/api/ecosystemCollaborationInnovation';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function CreateCollaborationInnovationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    
    const [formData, setFormData] = useState<EcosystemCollaborationInnovationInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: {
                text: '',
                highlighted: ''
            },
            quote: [],
            cta: []
        },
        ourPhilosophy: {
            title: '',
            subHeadline: '',
            img: {
                src: '',
                alt: ''
            },
            description: {
                text: '',
                highlighted: ''
            },
            keys: []
        },
        whoWeCelebrateWith: {
            title: '',
            items: []
        },
        innovationSpotlight: {
            title: '',
            keys: []
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

        try {
            await ecosystemCollaborationInnovationApi.create(formData);
            router.push('/ecosystem/collaboration-innovation');
        } catch (error) {
            console.error('Error creating collaboration innovation data:', error);
            alert('Failed to create collaboration innovation data');
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

    const addQuote = () => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: [...prev.mainPage.quote, { text: '', highlighted: '' }]
            }
        }));
    };

    const updateQuote = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: prev.mainPage.quote.map((quote, i) => 
                    i === index ? { ...quote, [field]: value } : quote
                )
            }
        }));
    };

    const removeQuote = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                quote: prev.mainPage.quote.filter((_, i) => i !== index)
            }
        }));
    };

    const addCTA = () => {
        const newIndex = formData.mainPage.cta.length;
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: [...prev.mainPage.cta, { text: '', href: '' }]
            }
        }));
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Create Collaboration & Innovation</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Page Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6">Main Page Content</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.mainPage.title}
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
                                value={formData.mainPage.subHeadline}
                                onChange={(e) => updateMainPage('subHeadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description Text
                                </label>
                                <textarea
                                    value={formData.mainPage.description.text}
                                    onChange={(e) => updateMainPage('description', { ...formData.mainPage.description, text: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description Highlighted
                                </label>
                                <textarea
                                    value={formData.mainPage.description.highlighted}
                                    onChange={(e) => updateMainPage('description', { ...formData.mainPage.description, highlighted: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Quotes Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
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
                            {formData.mainPage.quote.map((quote, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Quote Text"
                                            value={quote.text}
                                            onChange={(e) => updateQuote(index, 'text', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Quote Highlighted"
                                            value={quote.highlighted}
                                            onChange={(e) => updateQuote(index, 'highlighted', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeQuote(index)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                        {loading ? 'Creating...' : 'Create Collaboration Innovation'}
                    </button>
                </div>
            </form>
        </div>
    );
}