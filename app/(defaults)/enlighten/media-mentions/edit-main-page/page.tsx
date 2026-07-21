'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

interface MediaMentionCTA {
    text: string;
    href: string;
}

interface MediaMentionKey {
    text: string;
    highlighted: string;
}

interface MediaMentionMainPage {
    title: string;
    subHeadline: string;
    description: string;
    key: MediaMentionKey;
    cta: MediaMentionCTA[];
    recentHighlights: any[];
}

const EditMainPagePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mediaMentionsId, setMediaMentionsId] = useState<number | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    
    const [formData, setFormData] = useState<MediaMentionMainPage>({
        title: '',
        subHeadline: '',
        description: '',
        key: { text: '', highlighted: '' },
        cta: [],
        recentHighlights: []
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

    useEffect(() => {
        fetchMainPageData();
    }, []);

    const fetchMainPageData = async () => {
        try {
            const result = await apiClient.get('/api/enlighten/media-mentions');
            if (result.success && result.data?.mainPage) {
                setFormData(result.data.mainPage);
                setMediaMentionsId(result.data.id);
                
                // Initialize ctaLinkTypes based on existing CTAs
                const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
                result.data.mainPage.cta?.forEach((_: any, index: number) => {
                    initialLinkTypes[index] = 'navigation';
                });
                setCtaLinkTypes(initialLinkTypes);
            } else {
                // Initialize with default values if no data exists
                setFormData({
                    title: 'Media & Mentions',
                    subHeadline: 'In the News',
                    description: 'See how we are making headlines in the green energy sector.',
                    key: { text: 'Leading the conversation', highlighted: 'conversation' },
                    cta: [],
                    recentHighlights: []
                });
            }
        } catch (error: any) {
            console.error('Fetch main page data error:', error);
            Swal.fire('Error', 'Failed to fetch main page data', 'error');
        } finally {
            setFetchingData(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleKeyChange = (field: 'text' | 'highlighted', value: string) => {
        setFormData(prev => ({
            ...prev,
            key: { ...prev.key, [field]: value }
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
            cta: prev.cta.map((cta, i) => i === index ? { ...cta, [field]: value } : cta)
        }));
    };

    const removeCTA = (index: number) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index)
        }));
        // Remove the link type for this CTA
        setCtaLinkTypes(prev => {
            const updated = { ...prev };
            delete updated[index];
            // Re-index remaining CTAs
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.subHeadline.trim()) {
            newErrors.subHeadline = 'Sub-headline is required';
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
                id: mediaMentionsId,
                mainPage: formData
            };

            const result = mediaMentionsId 
                ? await apiClient.put('/api/enlighten/media-mentions', payload)
                : await apiClient.post('/api/enlighten/media-mentions', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Main page updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/enlighten/media-mentions');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update main page', 'error');
            }
        } catch (error: any) {
            console.error('Update main page error:', error);
            Swal.fire('Error', error.message || 'Failed to update main page', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Main Page</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter main page title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Sub-Headline */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Sub-Headline *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter sub-headline"
                            value={formData.subHeadline}
                            onChange={(e) => handleInputChange('subHeadline', e.target.value)}
                        />
                        {errors.subHeadline && <p className="text-red-500 text-sm mt-1">{errors.subHeadline}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            placeholder="Enter description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                    </div>

                    {/* Key Message */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Key Text
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Key message"
                                value={formData.key.text}
                                onChange={(e) => handleKeyChange('text', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Highlighted Text
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Highlighted part"
                                value={formData.key.highlighted}
                                onChange={(e) => handleKeyChange('highlighted', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Call-to-Action Buttons */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">
                                Call-to-Action Buttons
                            </label>
                            <button
                                type="button"
                                onClick={addCTA}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add CTA
                            </button>
                        </div>
                        
                        {formData.cta.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No CTA buttons added yet. Click "Add CTA" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.cta.map((cta, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">CTA {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCTA(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Button Text
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Button text"
                                                value={cta.text}
                                                onChange={(e) => updateCTA(index, 'text', e.target.value)}
                                            />
                                        </div>

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
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                    className="form-select w-full"
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
                                                    className="form-input w-full"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preview Section */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Preview</h4>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{formData.title || 'Title'}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formData.subHeadline || 'Sub-headline'}</p>
                            <p className="text-sm">{formData.description || 'Description'}</p>
                            {(formData.key.text || formData.key.highlighted) && (
                                <div className="text-sm italic">
                                    "{formData.key.text}" {formData.key.highlighted && <span className="font-semibold">- {formData.key.highlighted}</span>}
                                </div>
                            )}
                            {formData.cta.length > 0 && (
                                <div className="flex gap-2 pt-2">
                                    {formData.cta.map((cta, index) => (
                                        <span key={index} className="btn btn-sm btn-outline-primary">
                                            {cta.text || 'Button'}
                                        </span>
                                    ))}
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
        </ProtectedRoute>
    );
};

export default EditMainPagePage;