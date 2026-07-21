'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EcosystemOurValueChain, EcosystemOurValueChainInsert } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function EditEcosystemOurValueChainPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{ type: 'valueChain', index: number } | null>(null);
    
    const [formData, setFormData] = useState<EcosystemOurValueChainInsert>({
        title: '',
        subHeadline: '',
        description: { text: '', highlighted: '' },
        quote: [],
        cta: [],
        valueChainStrip: [],
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
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ecosystem/our-value-chain/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data: EcosystemOurValueChain = await response.json();
            
            setFormData({
                title: data.title,
                subHeadline: data.subHeadline,
                description: data.description,
                quote: data.quote,
                cta: data.cta,
                valueChainStrip: data.valueChainStrip,
            });
            
            // Initialize CTA link types
            const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
            data.cta?.forEach((_: any, index: number) => {
                initialLinkTypes[index] = 'navigation';
            });
            setCtaLinkTypes(initialLinkTypes);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/ecosystem/our-value-chain/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update data');
            }

            router.push('/ecosystem/our-value-chain');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const addQuote = () => {
        setFormData(prev => ({
            ...prev,
            quote: [...prev.quote, { text: '', highlighted: '' }]
        }));
    };

    const updateQuote = (index: number, field: 'text' | 'highlighted', value: string) => {
        setFormData(prev => ({
            ...prev,
            quote: prev.quote.map((quote, i) => 
                i === index ? { ...quote, [field]: value } : quote
            )
        }));
    };

    const removeQuote = (index: number) => {
        setFormData(prev => ({
            ...prev,
            quote: prev.quote.filter((_, i) => i !== index)
        }));
    };

    const addCTA = () => {
        const newIndex = formData.cta.length;
        setFormData(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.map((cta, i) => 
                i === index ? { ...cta, [field]: value } : cta
            )
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

    const addValueChainItem = () => {
        setFormData(prev => ({
            ...prev,
            valueChainStrip: [...prev.valueChainStrip, {
                img: { src: '', alt: '' },
                title: '',
                description: ''
            }]
        }));
    };

    const updateValueChainItem = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            valueChainStrip: prev.valueChainStrip.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeValueChainItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            valueChainStrip: prev.valueChainStrip.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Edit Ecosystem - Our Value Chain
                </h1>
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

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
                {/* Basic Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Sub Headline *
                        </label>
                        <input
                            type="text"
                            value={formData.subHeadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, subHeadline: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Description Text *
                        </label>
                        <textarea
                            value={formData.description.text}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: { ...prev.description, text: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Highlighted Text
                        </label>
                        <input
                            type="text"
                            value={formData.description.highlighted}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: { ...prev.description, highlighted: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Quotes */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Quotes</h2>
                        <button
                            type="button"
                            onClick={addQuote}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Quote
                        </button>
                    </div>

                    {formData.quote.map((quote, index) => (
                        <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Quote {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeQuote(index)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Quote Text
                                </label>
                                <textarea
                                    value={quote.text}
                                    onChange={(e) => updateQuote(index, 'text', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Highlighted Text
                                </label>
                                <input
                                    type="text"
                                    value={quote.highlighted}
                                    onChange={(e) => updateQuote(index, 'highlighted', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Call to Actions</h2>
                        <button
                            type="button"
                            onClick={addCTA}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add CTA
                        </button>
                    </div>

                    {formData.cta.map((cta, index) => (
                        <div key={index} className="border border-gray-300 rounded-md p-4 mb-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">CTA {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeCTA(index)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Text
                                </label>
                                <input
                                    type="text"
                                    value={cta.text}
                                    onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Link Type</label>
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
                                        value={cta.href}
                                        onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                        placeholder="Enter URL (e.g., /about or https://example.com)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Value Chain Strip */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Value Chain Strip</h2>
                        <button
                            type="button"
                            onClick={addValueChainItem}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Item
                        </button>
                    </div>

                    {formData.valueChainStrip.map((item, index) => (
                        <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Item {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeValueChainItem(index)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Item Image URL
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={item.img.src}
                                        onChange={(e) => updateValueChainItem(index, 'img', { ...item.img, src: e.target.value })}
                                        placeholder="Image URL"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMediaPickerTarget({ type: 'valueChain', index });
                                            setShowMediaPicker(true);
                                        }}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
                                    >
                                        Browse Media Library
                                    </button>
                                </div>
                                {item.img.src && (
                                    <div className="mt-2">
                                        <img src={item.img.src} alt={item.img.alt || "Preview"} className="max-w-xs h-auto rounded" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Image Alt Text
                                </label>
                                <input
                                    type="text"
                                    value={item.img.alt}
                                    onChange={(e) => updateValueChainItem(index, 'img', { ...item.img, alt: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateValueChainItem(index, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateValueChainItem(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                        </div>
                    ))}
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

            <MediaPicker
                isOpen={showMediaPicker}
                allowedTypes={['image']}
                onSelect={(url) => {
                    if (mediaPickerTarget) {
                        updateValueChainItem(mediaPickerTarget.index, 'img', { 
                            ...formData.valueChainStrip[mediaPickerTarget.index].img, 
                            src: url 
                        });
                    }
                    setShowMediaPicker(false);
                    setMediaPickerTarget(null);
                }}
                onClose={() => {
                    setShowMediaPicker(false);
                    setMediaPickerTarget(null);
                }}
                title="Select Image from Media Library"
            />
        </div>
    );
}