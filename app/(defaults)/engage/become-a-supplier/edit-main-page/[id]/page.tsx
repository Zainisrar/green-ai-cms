'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

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
        text: string;
        highlighted: string;
    };
    quote2: {
        text: string;
        highlighted: string;
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
        quote1: { text: '', highlighted: '' },
        quote2: { text: '', highlighted: '' },
        cta: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/become-a-supplier/${id}`);
            if (result.success && result.data.mainPage) {
                setFormData(result.data.mainPage);
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
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [field]: value }
        }));
    };

    const addCTA = () => {
        setFormData(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
        setCtaLinkTypes(prev => [...prev, 'navigation']);
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeCTA = (index: number) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index)
        }));
        setCtaLinkTypes(prev => prev.filter((_, i) => i !== index));
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
            const result = await apiClient.put(`/api/engage/become-a-supplier/${id}`, {
                mainPage: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Main page updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/become-a-supplier');
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
                        <button
                            onClick={() => router.push('/engage/become-a-supplier')}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
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
                    </div>

                    {/* Quotes */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Quotes</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 1 Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Enter first quote"
                                    value={formData.quote1.text}
                                    onChange={(e) => handleNestedChange('quote1', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 1 Highlighted</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted text in quote 1"
                                    value={formData.quote1.highlighted}
                                    onChange={(e) => handleNestedChange('quote1', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 2 Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Enter second quote"
                                    value={formData.quote2.text}
                                    onChange={(e) => handleNestedChange('quote2', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 2 Highlighted</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted text in quote 2"
                                    value={formData.quote2.highlighted}
                                    onChange={(e) => handleNestedChange('quote2', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Call-to-Action Buttons</h6>
                            <button
                                type="button"
                                onClick={addCTA}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add CTA Button
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.cta.map((cta, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">CTA Button {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeCTA(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Button Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter button text"
                                                value={cta.text}
                                                onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                            />
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
                                                <input
                                                    type="url"
                                                    className="form-input"
                                                    placeholder="https://example.com"
                                                    value={cta.href}
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                />
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Updating...' : 'Update Main Page'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/engage/become-a-supplier')}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
};

export default EditMainPagePage;