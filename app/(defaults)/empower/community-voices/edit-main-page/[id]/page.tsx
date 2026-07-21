'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
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
    quote1: {
        text1: string;
        highlighted1: string;
        text2: string;
        highlighted2: string;
    };
    quote2: {
        text: string;
        highlighted: string;
    };
    cta: Array<{
        text: string;
        href: string;
    }>; // CHANGED to array
    modals: Array<{
        img: {
            src: string;
            alt: string;
        };
        cta: string;
    }>;
}

const EditMainPagePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otherData, setOtherData] = useState<any>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<('navigation' | 'manual')[]>([]);

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
        quote1: { text1: '', highlighted1: '', text2: '', highlighted2: '' },
        quote2: { text: '', highlighted: '' },
        cta: [],
        modals: [],
    });

    useEffect(() => {
        if (id) {
            fetchCommunityVoicesData();
        }
    }, [id]);

    const fetchCommunityVoicesData = async () => {
        try {
            const result = await apiClient.get(`/api/empower/community-voices/${id}`);
            if (result.success) {
                const data = result.data;
                setFormData({
                    title: data.mainPage.title || '',
                    subHeadline: data.mainPage.subHeadline || '',
                    description: data.mainPage.description || { text: '', highlighted: '' },
                    quote1: data.mainPage.quote1 || { text1: '', highlighted1: '', text2: '', highlighted2: '' },
                    quote2: data.mainPage.quote2 || { text: '', highlighted: '' },
                    cta: Array.isArray(data.mainPage.cta) ? data.mainPage.cta : [],
                    modals: Array.isArray(data.mainPage.modals) ? data.mainPage.modals : [],
                });
                // Initialize CTA link types
                if (Array.isArray(data.mainPage.cta)) {
                    setCtaLinkTypes(data.mainPage.cta.map((cta: any) => 
                        (cta.href && cta.href.startsWith('/')) ? 'navigation' : 'manual'
                    ));
                }
                setOtherData(data.modals);
            } else {
                Swal.fire('Error', 'Failed to fetch community voices data', 'error');
                router.push('/empower/community-voices');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error', 'Failed to fetch community voices data', 'error');
            router.push('/empower/community-voices');
        } finally {
            setFetchingData(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: keyof MainPageFormData, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent] as any, [field]: value },
        }));
    };

    // CTA array handlers
    const addCta = () => {
        setFormData(prev => ({ ...prev, cta: [...prev.cta, { text: '', href: '' }] }));
        setCtaLinkTypes(prev => [...prev, 'navigation']);
    };
    const updateCta = (index: number, field: 'text' | 'href', value: string) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.map((c, i) => i === index ? { ...c, [field]: value } : c)
        }));
    };
    const removeCta = (index: number) => {
        setFormData(prev => ({ ...prev, cta: prev.cta.filter((_, i) => i !== index) }));
        setCtaLinkTypes(prev => prev.filter((_, i) => i !== index));
    };

    const addModal = () => {
        setFormData((prev) => ({
            ...prev,
            modals: [...prev.modals, { img: { src: '', alt: '' }, cta: '' }],
        }));
    };

    const updateModal = (index: number, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            modals: prev.modals.map((modal, i) => 
                i === index 
                    ? field === 'cta' 
                        ? { ...modal, cta: value }
                        : { ...modal, img: { ...modal.img, [field]: value } }
                    : modal
            ),
        }));
    };

    const removeModal = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            modals: prev.modals.filter((_, i) => i !== index),
        }));
    };

    const openMediaPicker = (index: number) => {
        setCurrentModalIndex(index);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (media: any) => {
        if (currentModalIndex !== null) {
            updateModal(currentModalIndex, 'src', media.url);
        }
        setShowMediaPicker(false);
        setCurrentModalIndex(null);
    };

    const handleRemoveModalImage = (index: number) => {
        updateModal(index, 'src', '');
        updateModal(index, 'alt', '');
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
            const payload = {
                mainPage: formData,
                modals: otherData,
            };

            const result = await apiClient.put(`/api/empower/community-voices/${id}`, payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Main page updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/community-voices');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update main page', 'error');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire('Error', error.message || 'Failed to update main page', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Community Voices Main Page</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
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

                    {/* Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Quotes */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Quotes</h4>
                        
                        {/* Quote 1 */}
                        <div className="p-4 border rounded-lg">
                            <h6 className="font-semibold mb-4">Quote 1</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Text 1</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Enter first part of quote"
                                        value={formData.quote1.text1}
                                        onChange={(e) => handleNestedChange('quote1', 'text1', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Highlighted 1</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Highlighted part 1"
                                        value={formData.quote1.highlighted1}
                                        onChange={(e) => handleNestedChange('quote1', 'highlighted1', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Text 2</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Enter second part of quote"
                                        value={formData.quote1.text2}
                                        onChange={(e) => handleNestedChange('quote1', 'text2', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Highlighted 2</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Highlighted part 2"
                                        value={formData.quote1.highlighted2}
                                        onChange={(e) => handleNestedChange('quote1', 'highlighted2', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quote 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 2 Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Enter quote 2"
                                    value={formData.quote2.text}
                                    onChange={(e) => handleNestedChange('quote2', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 2 Highlighted</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted part"
                                    value={formData.quote2.highlighted}
                                    onChange={(e) => handleNestedChange('quote2', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA ARRAY */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h6 className="text-sm font-semibold">Call-to-Action Buttons</h6>
                            <button type="button" onClick={addCta} className="btn btn-xs btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">Add CTA</button>
                        </div>
                        {formData.cta.length === 0 ? (
                            <p className="text-xs text-gray-500">No CTAs added yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {formData.cta.map((cta, idx) => (
                                    <div key={idx} className="grid grid-cols-1 gap-3 p-4 border rounded-lg">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Text</label>
                                            <input type="text" className="form-input" value={cta.text} onChange={(e) => updateCta(idx, 'text', e.target.value)} placeholder={`CTA text ${idx + 1}`} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Link Type</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`cta-link-type-${idx}`}
                                                        className="form-radio text-green-600"
                                                        checked={ctaLinkTypes[idx] === 'navigation'}
                                                        onChange={() => {
                                                            const newTypes = [...ctaLinkTypes];
                                                            newTypes[idx] = 'navigation';
                                                            setCtaLinkTypes(newTypes);
                                                        }}
                                                    />
                                                    <span className="ml-2 text-xs">Navigation Item</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`cta-link-type-${idx}`}
                                                        className="form-radio text-green-600"
                                                        checked={ctaLinkTypes[idx] === 'manual'}
                                                        onChange={() => {
                                                            const newTypes = [...ctaLinkTypes];
                                                            newTypes[idx] = 'manual';
                                                            setCtaLinkTypes(newTypes);
                                                        }}
                                                    />
                                                    <span className="ml-2 text-xs">Manual URL</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">URL</label>
                                            <div className="flex gap-2">
                                                {ctaLinkTypes[idx] === 'navigation' ? (
                                                    <select
                                                        className="form-select flex-1"
                                                        value={cta.href}
                                                        onChange={(e) => updateCta(idx, 'href', e.target.value)}
                                                    >
                                                        <option value="">Select navigation item</option>
                                                        {flatNavigationItems.map((item) => (
                                                            <option key={item.id} value={item.href}>
                                                                {item.displayName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input type="url" className="form-input flex-1" value={cta.href} onChange={(e) => updateCta(idx, 'href', e.target.value)} placeholder="https://..." />
                                                )}
                                                <button type="button" onClick={() => removeCta(idx)} className="btn btn-outline-danger btn-sm" title="Remove CTA">×</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modal Items */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Modal Items</label>
                            <button
                                type="button"
                                onClick={addModal}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add Modal Item
                            </button>
                        </div>
                        
                        {formData.modals.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No modal items added yet. Click "Add Modal Item" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.modals.map((modal, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h6 className="font-semibold">Modal Item {index + 1}</h6>
                                            <button
                                                type="button"
                                                onClick={() => removeModal(index)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Remove Modal Item"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Image</label>
                                                <button
                                                    type="button"
                                                    onClick={() => openMediaPicker(index)}
                                                    className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm"
                                                >
                                                    Browse Media Library
                                                </button>
                                                {modal.img.src && (
                                                    <div className="mt-2 relative inline-block">
                                                        <img
                                                            src={modal.img.src}
                                                            alt={modal.img.alt || 'Preview'}
                                                            className="w-32 h-32 object-cover rounded"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveModalImage(index)}
                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                            title="Remove Image"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                                {!modal.img.src && (
                                                    <p className="text-xs text-gray-500 mt-1">No image selected yet.</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Alt text for accessibility"
                                                    value={modal.img.alt}
                                                    onChange={(e) => updateModal(index, 'alt', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2">CTA Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="CTA text"
                                                value={modal.cta}
                                                onChange={(e) => updateModal(index, 'cta', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Saving...' : 'Save Main Page'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <MediaPicker
                isOpen={showMediaPicker}
                onSelect={handleMediaSelect}
                onClose={() => {
                    setShowMediaPicker(false);
                    setCurrentModalIndex(null);
                }}
                allowedTypes={['image']}
            />
        </ProtectedRoute>
    );
};

export default EditMainPagePage;