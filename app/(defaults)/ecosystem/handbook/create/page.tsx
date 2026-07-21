'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemHandbookApi } from '@/lib/api/ecosystemHandbook';
import type { EcosystemHandbookInsert } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function CreateEcosystemHandbookPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'ethos' | null>(null);
    
    const [formData, setFormData] = useState<Omit<EcosystemHandbookInsert, 'id' | 'createdAt' | 'updatedAt'>>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: '',
            quote: [],
            cta: []
        },
        ourProcurementEthos: {
            title: '',
            description: '',
            img: { src: '', alt: '' },
            keys: []
        },
        codeOfConduct: {
            title: '',
            item: []
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
            await ecosystemHandbookApi.create(formData);
            router.push('/ecosystem/handbook');
        } catch (error) {
            console.error('Error creating ecosystem handbook:', error);
            alert('Failed to create ecosystem handbook');
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

    const updateQuote = (index: number, field: 'text' | 'highlighted', value: string) => {
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

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
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

    const addEthosKey = () => {
        setFormData(prev => ({
            ...prev,
            ourProcurementEthos: {
                ...prev.ourProcurementEthos,
                keys: [...prev.ourProcurementEthos.keys, '']
            }
        }));
    };

    const removeEthosKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            ourProcurementEthos: {
                ...prev.ourProcurementEthos,
                keys: prev.ourProcurementEthos.keys.filter((_, i) => i !== index)
            }
        }));
    };

    const updateEthosKey = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            ourProcurementEthos: {
                ...prev.ourProcurementEthos,
                keys: prev.ourProcurementEthos.keys.map((key, i) => 
                    i === index ? value : key
                )
            }
        }));
    };

    const addConductItem = () => {
        setFormData(prev => ({
            ...prev,
            codeOfConduct: {
                ...prev.codeOfConduct,
                item: [...prev.codeOfConduct.item, { category: '', requiredStandard: '' }]
            }
        }));
    };

    const removeConductItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            codeOfConduct: {
                ...prev.codeOfConduct,
                item: prev.codeOfConduct.item.filter((_, i) => i !== index)
            }
        }));
    };

    const updateConductItem = (index: number, field: 'category' | 'requiredStandard', value: string) => {
        setFormData(prev => ({
            ...prev,
            codeOfConduct: {
                ...prev.codeOfConduct,
                item: prev.codeOfConduct.item.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Ecosystem Handbook</h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Page Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Main Page</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.mainPage.title}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { ...prev.mainPage, title: e.target.value }
                                    }))}
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
                                    value={formData.mainPage.subHeadline}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { ...prev.mainPage, subHeadline: e.target.value }
                                    }))}
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
                                    value={formData.mainPage.description}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        mainPage: { ...prev.mainPage, description: e.target.value }
                                    }))}
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
                                {formData.mainPage.quote.map((quote, index) => (
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
                                {formData.mainPage.cta.map((cta, index) => (
                                    <div key={index} className="border border-gray-200 rounded p-4 mb-3 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">CTA {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCTA(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="CTA text"
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

                    {/* Our Procurement Ethos Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Our Procurement Ethos</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.ourProcurementEthos.title}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        ourProcurementEthos: { ...prev.ourProcurementEthos, title: e.target.value }
                                    }))}
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
                                    value={formData.ourProcurementEthos.description}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        ourProcurementEthos: { ...prev.ourProcurementEthos, description: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                <div className="flex items-center gap-3 mb-2">
                                    <input
                                        type="text"
                                        value={formData.ourProcurementEthos.img.src}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            ourProcurementEthos: { 
                                                ...prev.ourProcurementEthos, 
                                                img: { ...prev.ourProcurementEthos.img, src: e.target.value } 
                                            }
                                        }))}
                                        placeholder="Image URL"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMediaPickerTarget('ethos');
                                            setShowMediaPicker(true);
                                        }}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
                                    >
                                        Browse Media Library
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.ourProcurementEthos.img.alt}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        ourProcurementEthos: { 
                                            ...prev.ourProcurementEthos, 
                                            img: { ...prev.ourProcurementEthos.img, alt: e.target.value } 
                                        }
                                    }))}
                                    placeholder="Image alt text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {formData.ourProcurementEthos.img.src && (
                                    <div className="mt-2">
                                        <img 
                                            src={formData.ourProcurementEthos.img.src} 
                                            alt={formData.ourProcurementEthos.img.alt || "Preview"} 
                                            className="max-w-xs h-auto rounded" 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Keys */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Key Points
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addEthosKey}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Add Key
                                    </button>
                                </div>
                                {formData.ourProcurementEthos.keys.map((key, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Key point"
                                            value={key}
                                            onChange={(e) => updateEthosKey(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeEthosKey(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Code of Conduct Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Code of Conduct</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.codeOfConduct.title}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        codeOfConduct: { ...prev.codeOfConduct, title: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Conduct Items */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Conduct Items
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addConductItem}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Add Item
                                    </button>
                                </div>
                                {formData.codeOfConduct.item.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded p-4 mb-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeConductItem(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Category"
                                                value={item.category}
                                                onChange={(e) => updateConductItem(index, 'category', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <textarea
                                                placeholder="Required standard"
                                                rows={3}
                                                value={item.requiredStandard}
                                                onChange={(e) => updateConductItem(index, 'requiredStandard', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
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
                            {loading ? 'Creating...' : 'Create Ecosystem Handbook'}
                        </button>
                    </div>
                </form>

                <MediaPicker
                    isOpen={showMediaPicker}
                    allowedTypes={['image']}
                    onSelect={(url) => {
                        if (mediaPickerTarget === 'ethos') {
                            setFormData(prev => ({
                                ...prev,
                                ourProcurementEthos: { 
                                    ...prev.ourProcurementEthos, 
                                    img: { ...prev.ourProcurementEthos.img, src: url } 
                                }
                            }));
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
        </div>
    );
}