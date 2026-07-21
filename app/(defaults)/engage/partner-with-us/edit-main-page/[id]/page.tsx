'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import MediaPicker from '@/components/apps/media/MediaPicker';

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

interface MainPageFormData {
    title: string;
    subHeadline: string;
    description: {
        text: string;
        highlighted: string;
    };
    key: Array<{
        title: string;
        description: string;
        cta: string;
    }>;
    quote: {
        text: string;
        highlighted: string;
    };
    img: {
        src: string;
        alt: string;
    };
    cta: Array<{
        text: string;
        href: string;
    }>;
}

const EditMainPagePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [ctaLinkTypes, setCtaLinkTypes] = useState<('navigation' | 'manual')[]>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const { data: navigationData } = useQuery({
        queryKey: ['navigation'],
        queryFn: async () => {
            const result = await apiClient.get('/api/navigation');
            return result.data || [];
        }
    });

    const flatNavigationItems = navigationData ? flattenNavItems(navigationData) : [];

    const [formData, setFormData] = useState<MainPageFormData>({
        title: '',
        subHeadline: '',
        description: { text: '', highlighted: '' },
        key: [],
        quote: { text: '', highlighted: '' },
        img: { src: '', alt: '' },
        cta: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/partner-with-us/${id}`);
            if (result.success && result.data.mainPage) {
                setFormData(result.data.mainPage);
                // Initialize CTA link types
                if (Array.isArray(result.data.mainPage.cta)) {
                    setCtaLinkTypes(result.data.mainPage.cta.map((cta: any) => 
                        (cta.href && cta.href.startsWith('/')) ? 'navigation' : 'manual'
                    ));
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof MainPageFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: string, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [field]: value },
        }));
    };

    const addKeyPoint = () => {
        setFormData((prev) => ({
            ...prev,
            key: [...prev.key, { title: '', description: '', cta: '' }],
        }));
    };

    const updateKeyPoint = (index: number, field: 'title' | 'description' | 'cta', value: string) => {
        setFormData((prev) => ({
            ...prev,
            key: prev.key.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        }));
    };

    const removeKeyPoint = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            key: prev.key.filter((_, i) => i !== index),
        }));
    };

    const addCTA = () => {
        setFormData((prev) => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }],
        }));
        setCtaLinkTypes(prev => [...prev, 'navigation']);
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        }));
    };

    const removeCTA = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index),
        }));
        setCtaLinkTypes(prev => prev.filter((_, i) => i !== index));
    };

    const handleMediaSelect = (media: any) => {
        setFormData(prev => ({
            ...prev,
            img: { ...prev.img, src: media.url }
        }));
        setShowMediaPicker(false);
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            img: { src: '', alt: '' }
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.subHeadline.trim()) {
            newErrors.subHeadline = 'Sub-headline is required';
        }

        if (!formData.description.text.trim()) {
            newErrors.description = 'Description text is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await apiClient.put(`/api/engage/partner-with-us/${id}`, {
                mainPage: formData,
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Main page updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/partner-with-us');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update', 'error');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire('Error', error.message || 'Failed to update', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.push('/engage/partner-with-us')} className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600">
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Main Page</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Basic Information</h6>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input type="text" className="form-input" placeholder="Enter title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Sub-Headline *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter sub-headline"
                                    value={formData.subHeadline}
                                    onChange={(e) => handleInputChange('subHeadline', e.target.value)}
                                />
                                {errors.subHeadline && <p className="text-red-500 text-sm mt-1">{errors.subHeadline}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Description Text *</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Enter description"
                                    value={formData.description.text}
                                    onChange={(e) => handleNestedChange('description', 'text', e.target.value)}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description Highlighted</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted text"
                                    value={formData.description.highlighted}
                                    onChange={(e) => handleNestedChange('description', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Enter quote"
                                    value={formData.quote.text}
                                    onChange={(e) => handleNestedChange('quote', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Highlighted</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted quote text"
                                    value={formData.quote.highlighted}
                                    onChange={(e) => handleNestedChange('quote', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Image</label>
                                <button
                                    type="button"
                                    onClick={() => setShowMediaPicker(true)}
                                    className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm w-full"
                                >
                                    Browse Media Library
                                </button>
                                {formData.img.src && (
                                    <div className="mt-3 space-y-2">
                                        <img
                                            src={formData.img.src}
                                            alt={formData.img.alt || 'Main image'}
                                            className="rounded border w-full max-h-48 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="btn btn-outline-danger btn-xs w-full"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                                {!formData.img.src && (
                                    <p className="text-xs text-gray-500 mt-2">No image selected yet.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Alt text for accessibility"
                                    value={formData.img.alt}
                                    onChange={(e) => handleNestedChange('img', 'alt', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Key Points */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Key Points</h6>
                            <button type="button" onClick={addKeyPoint} className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600">
                                <IconPlusCircle className="w-4 h-4 mr-2" />
                                Add Key Point
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.key.map((keyPoint, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Key Point {index + 1}</h6>
                                        <button type="button" onClick={() => removeKeyPoint(index)} className="btn btn-outline-danger btn-sm">
                                            <IconTrashLines className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter key point title"
                                                value={keyPoint.title}
                                                onChange={(e) => updateKeyPoint(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                placeholder="Enter description"
                                                value={keyPoint.description}
                                                onChange={(e) => updateKeyPoint(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">CTA Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Call-to-action text"
                                                value={keyPoint.cta}
                                                onChange={(e) => updateKeyPoint(index, 'cta', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.key.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No key points added yet. Click "Add Key Point" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Call-to-Action Buttons</h6>
                            <button type="button" onClick={addCTA} className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600">
                                <IconPlusCircle className="w-4 h-4 mr-2" />
                                Add CTA Button
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.cta.map((cta, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">CTA Button {index + 1}</h6>
                                        <button type="button" onClick={() => removeCTA(index)} className="btn btn-outline-danger btn-sm">
                                            <IconTrashLines className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Button Text</label>
                                            <input type="text" className="form-input" placeholder="Enter button text" value={cta.text} onChange={(e) => updateCTA(index, 'text', e.target.value)} />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Link Type</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`cta-link-type-${index}`}
                                                        className="form-radio text-green-600"
                                                        checked={ctaLinkTypes[index] === 'navigation'}
                                                        onChange={() => {
                                                            const newTypes = [...ctaLinkTypes];
                                                            newTypes[index] = 'navigation';
                                                            setCtaLinkTypes(newTypes);
                                                        }}
                                                    />
                                                    <span className="ml-2">Navigation Item</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`cta-link-type-${index}`}
                                                        className="form-radio text-green-600"
                                                        checked={ctaLinkTypes[index] === 'manual'}
                                                        onChange={() => {
                                                            const newTypes = [...ctaLinkTypes];
                                                            newTypes[index] = 'manual';
                                                            setCtaLinkTypes(newTypes);
                                                        }}
                                                    />
                                                    <span className="ml-2">Manual URL</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Button Link</label>
                                            {ctaLinkTypes[index] === 'navigation' ? (
                                                <select
                                                    className="form-select"
                                                    value={cta.href}
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                >
                                                    <option value="">Select navigation item</option>
                                                    {flatNavigationItems.map((item) => (
                                                        <option key={item.id} value={item.href}>
                                                            {item.displayName}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="url" className="form-input" placeholder="https://example.com" value={cta.href} onChange={(e) => updateCTA(index, 'href', e.target.value)} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.cta.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No CTA buttons added yet. Click "Add CTA Button" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                            {loading ? 'Updating...' : 'Update Main Page'}
                        </button>
                        <button type="button" onClick={() => router.push('/engage/partner-with-us')} className="btn btn-outline-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <MediaPicker
                isOpen={showMediaPicker}
                onSelect={handleMediaSelect}
                onClose={() => setShowMediaPicker(false)}
                allowedTypes={['image']}
            />
        </ProtectedRoute>
    );
};

export default EditMainPagePage;
