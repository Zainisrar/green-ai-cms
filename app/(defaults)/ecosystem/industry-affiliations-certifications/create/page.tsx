'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemIndustryAffiliationsCertificationsApi } from '@/lib/api/ecosystemIndustryAffiliationsCertifications';
import { EcosystemIndustryAffiliationsCertificationsInsert } from '@/db/schema';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function CreateIndustryAffiliationsCertificationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'certification' | 'whatThis' | null>(null);

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

    const [formData, setFormData] = useState<EcosystemIndustryAffiliationsCertificationsInsert>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '' },
            quote: [],
            cta: []
        },
        whyCertificationAffiliationMatter: {
            title: '',
            description: '',
            img: { src: '', alt: '' },
            keys: [],
            quote: { text: '', highlighted: '' }
        },
        ourCurrentCertifications: {
            title: '',
            items: []
        },
        industryAffiliations: {
            title: '',
            quote: { text: '', highlighted: '' },
            keys: []
        },
        whatThisMeansClients: {
            title: '',
            img: { src: '', alt: '' },
            keys: []
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await ecosystemIndustryAffiliationsCertificationsApi.create(formData);
            router.push('/ecosystem/industry-affiliations-certifications');
        } catch (err: any) {
            console.error('Error creating data:', err);
            setError(err.response?.data?.message || 'Failed to create data');
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Create Industry Affiliations & Certifications</h1>
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

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Page Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Main Page</h2>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.mainPage.description.text}
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
                            {formData.mainPage.quote.map((quote, index) => (
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
                            {formData.mainPage.cta.map((cta, index) => (
                                <div key={index} className="border border-gray-300 rounded p-4 mb-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">CTA {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCTA(index)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="CTA text"
                                        value={cta.text}
                                        onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <MediaPicker
                    isOpen={showMediaPicker}
                    allowedTypes={['image']}
                    onSelect={(url) => {
                        if (mediaPickerTarget === 'certification') {
                            setFormData(prev => ({
                                ...prev,
                                whyCertificationAffiliationMatter: {
                                    ...prev.whyCertificationAffiliationMatter,
                                    img: { ...prev.whyCertificationAffiliationMatter.img, src: url }
                                }
                            }));
                        } else if (mediaPickerTarget === 'whatThis') {
                            setFormData(prev => ({
                                ...prev,
                                whatThisMeansClients: {
                                    ...prev.whatThisMeansClients,
                                    img: { ...prev.whatThisMeansClients.img, src: url }
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