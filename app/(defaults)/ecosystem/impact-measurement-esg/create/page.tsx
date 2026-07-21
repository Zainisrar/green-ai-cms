'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemImpactMeasurementESGApi } from '@/lib/api/ecosystemImpactMeasurementESG';
import { EcosystemImpactMeasurementESGInsert } from '@/db/schema';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function CreateEcosystemImpactMeasurementESGPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const [formData, setFormData] = useState<EcosystemImpactMeasurementESGInsert>({
        mainPage: {
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
        },
        whyEsgMattersGreen: {
            title: '',
            subHeadline: '',
            description: '',
            keys: []
        },
        esgIntegrationProjectLifeCycle: {
            title: '',
            items: [],
            quote: {
                text: '',
                highlighted: ''
            }
        },
        trustSignals: {
            title: '',
            items: [],
            quote: {
                text: '',
                highlighted: ''
            }
        },
        sampleMetricsSnapshot: {
            title: '',
            description: {
                text: '',
                highlighted: ''
            },
            keys: []
        },
        howWeMeasureImpact: {
            metrics: [],
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
            await ecosystemImpactMeasurementESGApi.create(formData);
            router.push('/ecosystem/impact-measurement-esg');
        } catch (err) {
            setError('Failed to create data');
            console.error('Error creating data:', err);
        } finally {
            setLoading(false);
        }
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

    const addWhyESGKey = () => {
        setFormData(prev => ({
            ...prev,
            whyEsgMattersGreen: {
                ...prev.whyEsgMattersGreen,
                keys: [...prev.whyEsgMattersGreen.keys, { text: '', highlighted: '' }]
            }
        }));
    };

    const removeWhyESGKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            whyEsgMattersGreen: {
                ...prev.whyEsgMattersGreen,
                keys: prev.whyEsgMattersGreen.keys.filter((_, i) => i !== index)
            }
        }));
    };

    const addESGIntegrationItem = () => {
        setFormData(prev => ({
            ...prev,
            esgIntegrationProjectLifeCycle: {
                ...prev.esgIntegrationProjectLifeCycle,
                items: [...prev.esgIntegrationProjectLifeCycle.items, { title: '', description: '' }]
            }
        }));
    };

    const removeESGIntegrationItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            esgIntegrationProjectLifeCycle: {
                ...prev.esgIntegrationProjectLifeCycle,
                items: prev.esgIntegrationProjectLifeCycle.items.filter((_, i) => i !== index)
            }
        }));
    };

    const addTrustSignalItem = () => {
        setFormData(prev => ({
            ...prev,
            trustSignals: {
                ...prev.trustSignals,
                items: [...prev.trustSignals.items, '']
            }
        }));
    };

    const removeTrustSignalItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            trustSignals: {
                ...prev.trustSignals,
                items: prev.trustSignals.items.filter((_, i) => i !== index)
            }
        }));
    };

    const addMetricsKey = () => {
        setFormData(prev => ({
            ...prev,
            sampleMetricsSnapshot: {
                ...prev.sampleMetricsSnapshot,
                keys: [...prev.sampleMetricsSnapshot.keys, { text: '', highlighted: '' }]
            }
        }));
    };

    const removeMetricsKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sampleMetricsSnapshot: {
                ...prev.sampleMetricsSnapshot,
                keys: prev.sampleMetricsSnapshot.keys.filter((_, i) => i !== index)
            }
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create Ecosystem Impact Measurement ESG
                    </h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Back
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Page Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Main Page</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.mainPage.title}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { ...prev.mainPage, title: e.target.value }
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
                                    value={formData.mainPage.subHeadline}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { ...prev.mainPage, subHeadline: e.target.value }
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
                                    value={formData.mainPage.description.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: {
                                            ...prev.mainPage,
                                            description: { ...prev.mainPage.description, text: e.target.value }
                                        }
                                    }))}
                                    rows={3}
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
                                    value={formData.mainPage.description.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: {
                                            ...prev.mainPage,
                                            description: { ...prev.mainPage.description, highlighted: e.target.value }
                                        }
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
                                    value={formData.mainPage.quote.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: {
                                            ...prev.mainPage,
                                            quote: { ...prev.mainPage.quote, text: e.target.value }
                                        }
                                    }))}
                                    rows={3}
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
                                    value={formData.mainPage.quote.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: {
                                            ...prev.mainPage,
                                            quote: { ...prev.mainPage.quote, highlighted: e.target.value }
                                        }
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
                            {formData.mainPage.cta.map((cta, index) => (
                                <div key={index} className="mb-4 p-4 border rounded-lg space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">CTA {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCTA(index)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    
                                    <input
                                        type="text"
                                        placeholder="CTA Text"
                                        value={cta.text}
                                        onChange={(e) => {
                                            const newCTA = [...formData.mainPage.cta];
                                            newCTA[index].text = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                mainPage: { ...prev.mainPage, cta: newCTA }
                                            }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    
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
                                                onChange={(e) => {
                                                    const newCTA = [...formData.mainPage.cta];
                                                    newCTA[index].href = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        mainPage: { ...prev.mainPage, cta: newCTA }
                                                    }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                onChange={(e) => {
                                                    const newCTA = [...formData.mainPage.cta];
                                                    newCTA[index].href = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        mainPage: { ...prev.mainPage, cta: newCTA }
                                                    }));
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Why ESG Matters Green Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Why ESG Matters Green</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.whyEsgMattersGreen.title}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        whyEsgMattersGreen: { ...prev.whyEsgMattersGreen, title: e.target.value }
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
                                    value={formData.whyEsgMattersGreen.subHeadline}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        whyEsgMattersGreen: { ...prev.whyEsgMattersGreen, subHeadline: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.whyEsgMattersGreen.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    whyEsgMattersGreen: { ...prev.whyEsgMattersGreen, description: e.target.value }
                                }))}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Keys
                                </label>
                                <button
                                    type="button"
                                    onClick={addWhyESGKey}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    Add Key
                                </button>
                            </div>
                            {formData.whyEsgMattersGreen.keys.map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Key Text"
                                        value={key.text}
                                        onChange={(e) => {
                                            const newKeys = [...formData.whyEsgMattersGreen.keys];
                                            newKeys[index].text = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                whyEsgMattersGreen: { ...prev.whyEsgMattersGreen, keys: newKeys }
                                            }));
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Highlighted Text"
                                        value={key.highlighted}
                                        onChange={(e) => {
                                            const newKeys = [...formData.whyEsgMattersGreen.keys];
                                            newKeys[index].highlighted = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                whyEsgMattersGreen: { ...prev.whyEsgMattersGreen, keys: newKeys }
                                            }));
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeWhyESGKey(index)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
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
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}