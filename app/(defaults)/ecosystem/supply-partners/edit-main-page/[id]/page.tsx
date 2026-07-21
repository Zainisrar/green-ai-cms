'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemSupplyPartnersApi } from '@/lib/api/ecosystemSupplyPartners';
import { EcosystemSupplyPartners, EcosystemSupplyPartnersInsert } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function EditSupplyPartnersMainPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<number | null>(null);

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
    
    const [formData, setFormData] = useState({
        title: '',
        subHeadline: '',
        description: { text: '', highlighted: '' },
        quote: { text: '', highlighted: '' },
        cta: [] as { text: string; href: string }[],
        partnerSpotlight: {
            icons: [] as { src: string; alt: string }[],
            text: ''
        }
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await ecosystemSupplyPartnersApi.getById(parseInt(id));
            setFormData(data.mainPage);
            // Initialize ctaLinkTypes
            const types: { [key: number]: 'navigation' | 'manual' } = {};
            data.mainPage.cta.forEach((cta: any, index: number) => {
                types[index] = 'manual';
            });
            setCtaLinkTypes(types);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await ecosystemSupplyPartnersApi.updateSection(parseInt(id), 'mainPage', formData);
            router.push('/ecosystem/supply-partners');
        } catch (err: any) {
            console.error('Error updating data:', err);
            setError(err?.message || 'Failed to update data');
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

    const addIcon = () => {
        setFormData(prev => ({
            ...prev,
            partnerSpotlight: {
                ...prev.partnerSpotlight,
                icons: [...prev.partnerSpotlight.icons, { src: '', alt: '' }]
            }
        }));
    };

    const updateIcon = (index: number, field: 'src' | 'alt', value: string) => {
        setFormData(prev => ({
            ...prev,
            partnerSpotlight: {
                ...prev.partnerSpotlight,
                icons: prev.partnerSpotlight.icons.map((icon, i) => 
                    i === index ? { ...icon, [field]: value } : icon
                )
            }
        }));
    };

    const removeIcon = (index: number) => {
        setFormData(prev => ({
            ...prev,
            partnerSpotlight: {
                ...prev.partnerSpotlight,
                icons: prev.partnerSpotlight.icons.filter((_, i) => i !== index)
            }
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
                    Edit Supply Partners - Main Page
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

                {/* Quote */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quote</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Quote Text
                        </label>
                        <textarea
                            value={formData.quote.text}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                quote: { ...prev.quote, text: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Highlighted Text
                        </label>
                        <input
                            type="text"
                            value={formData.quote.highlighted}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                quote: { ...prev.quote, highlighted: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
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
                        <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">CTA {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeCTA(index)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    Remove
                                </button>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        {ctaLinkTypes[index] === 'navigation' ? 'Navigation Item' : 'URL'}
                                    </label>
                                    {ctaLinkTypes[index] === 'navigation' ? (
                                        <select
                                            value={cta.href}
                                            onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            value={cta.href}
                                            onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Partner Spotlight */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Partner Spotlight</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Spotlight Text
                        </label>
                        <textarea
                            value={formData.partnerSpotlight.text}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                partnerSpotlight: { ...prev.partnerSpotlight, text: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Partner Icons</h3>
                            <button
                                type="button"
                                onClick={addIcon}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Add Icon
                            </button>
                        </div>

                        {formData.partnerSpotlight.icons.map((icon, index) => (
                            <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-md font-medium">Icon {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeIcon(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                
                                <ImageUploadField
                                    value={{ src: icon.src, alt: icon.alt }}
                                    onChange={(img) => {
                                        const updatedIcons = [...formData.partnerSpotlight.icons];
                                        updatedIcons[index] = img;
                                        setFormData(prev => ({
                                            ...prev,
                                            partnerSpotlight: {
                                                ...prev.partnerSpotlight,
                                                icons: updatedIcons
                                            }
                                        }));
                                    }}
                                    folder="ecosystem/supply-partners"
                                    label={`Partner Icon ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMediaPickerTarget(index);
                                        setShowMediaPicker(true);
                                    }}
                                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                    Browse Media Library
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

            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    allowedTypes={['image']}
                    onSelect={(media) => {
                        if (mediaPickerTarget !== null) {
                            const updatedIcons = [...formData.partnerSpotlight.icons];
                            updatedIcons[mediaPickerTarget] = { src: media, alt: '' };
                            setFormData(prev => ({
                                ...prev,
                                partnerSpotlight: {
                                    ...prev.partnerSpotlight,
                                    icons: updatedIcons
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
                />
            )}
        </div>
    );
}