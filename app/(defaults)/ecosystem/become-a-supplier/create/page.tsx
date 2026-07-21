'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemBecomeSupplierApi } from '@/lib/api/ecosystemBecomeSupplier';
import { EcosystemBecomeSupplierInsert } from '@/db/schema';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function CreateEcosystemBecomeSupplierPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const [formData, setFormData] = useState<EcosystemBecomeSupplierInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote: [{ text: '', highlighted: '' }],
            cta: [{ text: '', href: '' }]
        },
        whatYouNeed: {
            title: '',
            keys: ['']
        },
        whyGreen: {
            title: '',
            img: { src: '', alt: '' },
            keys: ['']
        }
    });

    // Fetch navigation items for CTA dropdown
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    // Flatten navigation items to show hierarchy
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
            await ecosystemBecomeSupplierApi.create(formData);
            router.push('/ecosystem/become-a-supplier');
        } catch (err) {
            setError('Failed to create become a supplier');
            console.error(err);
        } finally {
            setLoading(false);
        }
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

    const removeCTA = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: prev.mainPage.cta.filter((_, i) => i !== index)
            }
        }));
        // Remove and re-index link types
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

    const addWhatYouNeedKey = () => {
        setFormData(prev => ({
            ...prev,
            whatYouNeed: {
                ...prev.whatYouNeed,
                keys: [...prev.whatYouNeed.keys, '']
            }
        }));
    };

    const removeWhatYouNeedKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            whatYouNeed: {
                ...prev.whatYouNeed,
                keys: prev.whatYouNeed.keys.filter((_, i) => i !== index)
            }
        }));
    };

    const addWhyGreenKey = () => {
        setFormData(prev => ({
            ...prev,
            whyGreen: {
                ...prev.whyGreen,
                keys: [...prev.whyGreen.keys, '']
            }
        }));
    };

    const removeWhyGreenKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            whyGreen: {
                ...prev.whyGreen,
                keys: prev.whyGreen.keys.filter((_, i) => i !== index)
            }
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Create Become a Supplier</h1>
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Page Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Main Page</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.mainPage.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mainPage: { ...prev.mainPage, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.mainPage.subHeadline}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mainPage: { ...prev.mainPage, subHeadline: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        {/* Description */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description Text</label>
                                <textarea
                                    value={formData.mainPage.description.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { 
                                            ...prev.mainPage, 
                                            description: { ...prev.mainPage.description, text: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description Highlighted</label>
                                <textarea
                                    value={formData.mainPage.description.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { 
                                            ...prev.mainPage, 
                                            description: { ...prev.mainPage.description, highlighted: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                        </div>

                        {/* Quotes */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Quotes</label>
                                <button
                                    type="button"
                                    onClick={addQuote}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Quote
                                </button>
                            </div>
                            {formData.mainPage.quote.map((quote, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Quote {index + 1}</span>
                                        {formData.mainPage.quote.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuote(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Quote text"
                                            value={quote.text}
                                            onChange={(e) => {
                                                const newQuotes = [...formData.mainPage.quote];
                                                newQuotes[index].text = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    mainPage: { ...prev.mainPage, quote: newQuotes }
                                                }));
                                            }}
                                            className="p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Highlighted text"
                                            value={quote.highlighted}
                                            onChange={(e) => {
                                                const newQuotes = [...formData.mainPage.quote];
                                                newQuotes[index].highlighted = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    mainPage: { ...prev.mainPage, quote: newQuotes }
                                                }));
                                            }}
                                            className="p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
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
                            {formData.mainPage.cta.map((cta, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">CTA {index + 1}</span>
                                        {formData.mainPage.cta.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCTA(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    
                                    <input
                                        type="text"
                                        placeholder="CTA text"
                                        value={cta.text}
                                        onChange={(e) => {
                                            const newCTAs = [...formData.mainPage.cta];
                                            newCTAs[index].text = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                mainPage: { ...prev.mainPage, cta: newCTAs }
                                            }));
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded"
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Link Type</label>
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
                                                    const newCTAs = [...formData.mainPage.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        mainPage: { ...prev.mainPage, cta: newCTAs }
                                                    }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded"
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
                                                    const newCTAs = [...formData.mainPage.cta];
                                                    newCTAs[index].href = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        mainPage: { ...prev.mainPage, cta: newCTAs }
                                                    }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* What You Need Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">What You Need</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.whatYouNeed.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    whatYouNeed: { ...prev.whatYouNeed, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Keys</label>
                                <button
                                    type="button"
                                    onClick={addWhatYouNeedKey}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {formData.whatYouNeed.keys.map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Enter key point"
                                        value={key}
                                        onChange={(e) => {
                                            const newKeys = [...formData.whatYouNeed.keys];
                                            newKeys[index] = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                whatYouNeed: { ...prev.whatYouNeed, keys: newKeys }
                                            }));
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        required
                                    />
                                    {formData.whatYouNeed.keys.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWhatYouNeedKey(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Why Green Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Why Green</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.whyGreen.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    whyGreen: { ...prev.whyGreen, title: e.target.value }
                                }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                <div className="border rounded-lg p-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaPicker(true)}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Browse Media Library
                                    </button>
                                    {formData.whyGreen.img.src && (
                                        <div className="mt-3">
                                            <img src={formData.whyGreen.img.src} alt={formData.whyGreen.img.alt} className="w-32 h-32 object-cover rounded" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    whyGreen: { 
                                                        ...prev.whyGreen, 
                                                        img: { src: '', alt: '' }
                                                    }
                                                }))}
                                                className="text-red-600 hover:text-red-800 text-sm mt-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
                                <input
                                    type="text"
                                    value={formData.whyGreen.img.alt}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        whyGreen: { 
                                            ...prev.whyGreen, 
                                            img: { ...prev.whyGreen.img, alt: e.target.value }
                                        }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Keys</label>
                                <button
                                    type="button"
                                    onClick={addWhyGreenKey}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {formData.whyGreen.keys.map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Enter key point"
                                        value={key}
                                        onChange={(e) => {
                                            const newKeys = [...formData.whyGreen.keys];
                                            newKeys[index] = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                whyGreen: { ...prev.whyGreen, keys: newKeys }
                                            }));
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        required
                                    />
                                    {formData.whyGreen.keys.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWhyGreenKey(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
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
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Become a Supplier'}
                    </button>
                </div>
            </form>

            {/* MediaPicker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    allowedTypes={['image']}
                    onSelect={(url: string) => {
                        setFormData(prev => ({
                            ...prev,
                            whyGreen: { 
                                ...prev.whyGreen, 
                                img: { ...prev.whyGreen.img, src: url }
                            }
                        }));
                        setShowMediaPicker(false);
                    }}
                    onClose={() => setShowMediaPicker(false)}
                    title="Select Image"
                />
            )}
        </div>
    );
}