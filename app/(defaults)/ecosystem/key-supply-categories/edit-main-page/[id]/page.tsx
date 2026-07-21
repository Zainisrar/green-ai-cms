'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemKeySupplyCategoriesApi } from '@/lib/api/ecosystemKeySupplyCategories';
import { EcosystemKeySupplyCategories, KeySupplyCategoriesMainPage } from '@/db/schema';
import { navigationApi } from '@/lib/api/navigation';
import { navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

export default function EditMainPageKeySupplyCategoriesPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemKeySupplyCategories | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    // Fetch navigation items
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll()
    });

    // Flatten navigation items for dropdown
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

    const [formData, setFormData] = useState<KeySupplyCategoriesMainPage>({
        title: '',
        subHeadline: '',
        description: { text: '', highlighted: '' },
        quote: { text: '', highlighted: '' },
        cta: [{ text: '', href: '' }]
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemKeySupplyCategoriesApi.getById(id);
            setData(result);
            setFormData(result.mainPage);
            // Initialize ctaLinkTypes
            const types: { [key: number]: 'navigation' | 'manual' } = {};
            result.mainPage.cta.forEach((cta: any, index: number) => {
                types[index] = 'manual';
            });
            setCtaLinkTypes(types);
        } catch (err) {
            setError('Failed to load key supply categories data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await ecosystemKeySupplyCategoriesApi.update(id, {
                mainPage: formData
            });
            router.push('/ecosystem/key-supply-categories');
        } catch (err) {
            setError('Failed to update main page');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addCTA = () => {
        const newIndex = formData.cta.length;
        setCtaLinkTypes({ ...ctaLinkTypes, [newIndex]: 'manual' });
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
        // Re-index remaining CTAs
        const newTypes: { [key: number]: 'navigation' | 'manual' } = {};
        Object.keys(ctaLinkTypes).forEach(key => {
            const keyNum = parseInt(key);
            if (keyNum < index) {
                newTypes[keyNum] = ctaLinkTypes[keyNum];
            } else if (keyNum > index) {
                newTypes[keyNum - 1] = ctaLinkTypes[keyNum];
            }
        });
        setCtaLinkTypes(newTypes);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Main Page - Key Supply Categories</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Main Page Content</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.subHeadline}
                                onChange={(e) => setFormData(prev => ({ ...prev, subHeadline: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        {/* Description */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description Text</label>
                                <textarea
                                    value={formData.description.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: { ...prev.description, text: e.target.value }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description Highlighted</label>
                                <textarea
                                    value={formData.description.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: { ...prev.description, highlighted: e.target.value }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                                <textarea
                                    value={formData.quote.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        quote: { ...prev.quote, text: e.target.value }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                                <textarea
                                    value={formData.quote.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        quote: { ...prev.quote, highlighted: e.target.value }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                        </div>

                        {/* CTAs */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">CTAs</label>
                                <button
                                    type="button"
                                    onClick={addCTA}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add CTA
                                </button>
                            </div>
                            {formData.cta.map((cta, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">CTA {index + 1}</span>
                                        {formData.cta.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCTA(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
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
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="CTA text"
                                            value={cta.text}
                                            onChange={(e) => {
                                                const newCTAs = [...formData.cta];
                                                newCTAs[index].text = e.target.value;
                                                setFormData(prev => ({ ...prev, cta: newCTAs }));
                                            }}
                                            className="p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        {ctaLinkTypes[index] === 'navigation' ? (
                                            <select
                                                value={cta.href}
                                                onChange={(e) => {
                                                    const newCTAs = [...formData.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setFormData(prev => ({ ...prev, cta: newCTAs }));
                                                }}
                                                className="p-2 border border-gray-300 rounded"
                                                required
                                            >
                                                <option value="">Select navigation item</option>
                                                {allNavItems.map((item) => (
                                                    <option key={item.href} value={item.href}>
                                                        {item.displayName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="CTA href"
                                                value={cta.href}
                                                onChange={(e) => {
                                                    const newCTAs = [...formData.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setFormData(prev => ({ ...prev, cta: newCTAs }));
                                                }}
                                                className="p-2 border border-gray-300 rounded"
                                                required
                                            />
                                        )}
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
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}