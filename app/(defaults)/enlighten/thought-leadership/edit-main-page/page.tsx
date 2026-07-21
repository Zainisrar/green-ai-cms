'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

interface EditorialCTA {
    text: string;
    href: string;
}

interface ThoughtLeadershipMainPage {
    title: string;
    subTitle: string;
    description: string;
    editorialsTitle: string;
    quote: {
        text: string;
        highlighted: string;
    };
    cta: EditorialCTA[];
}

interface ThoughtLeadershipData {
    id?: number;
    editorials: any[];
    mainPage: ThoughtLeadershipMainPage;
}

const EditMainPagePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [thoughtLeadershipData, setThoughtLeadershipData] = useState<ThoughtLeadershipData | null>(null);
    const [formData, setFormData] = useState<ThoughtLeadershipMainPage>({
        title: '',
        subTitle: '',
        description: '',
        editorialsTitle: '',
        quote: {
            text: '',
            highlighted: '',
        },
        cta: [],
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
        fetchThoughtLeadershipData();
    }, []);

    const fetchThoughtLeadershipData = async () => {
        try {
            const result = await apiClient.get('/api/enlighten/thought-leadership');
            if (result.success) {
                setThoughtLeadershipData(result.data);
                setFormData(result.data.mainPage);
                
                // Initialize ctaLinkTypes based on existing CTAs
                const initialLinkTypes: { [key: number]: 'navigation' | 'manual' } = {};
                result.data.mainPage.cta?.forEach((_: any, index: number) => {
                    initialLinkTypes[index] = 'navigation';
                });
                setCtaLinkTypes(initialLinkTypes);
            }
        } catch (error: any) {
            console.error('Fetch thought leadership data error:', error);
            Swal.fire('Error', 'Failed to load main page data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleQuoteChange = (field: 'text' | 'highlighted', value: string) => {
        setFormData((prev) => ({
            ...prev,
            quote: {
                ...prev.quote,
                [field]: value,
            },
        }));
    };

    const handleCTAChange = (index: number, field: 'text' | 'href', value: string) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        }));
    };

    const addCTA = () => {
        const newIndex = formData.cta.length;
        setFormData((prev) => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }],
        }));
        setCtaLinkTypes((prev) => ({ ...prev, [newIndex]: 'navigation' }));
    };

    const removeCTA = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index),
        }));
        // Remove the link type for this CTA
        setCtaLinkTypes((prev) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                id: thoughtLeadershipData?.id,
                editorials: thoughtLeadershipData?.editorials || [],
                mainPage: formData,
            };

            const result = await apiClient.put('/api/enlighten/thought-leadership', payload);
            if (result.success) {
                Swal.fire('Success', 'Main page updated successfully', 'success');
                router.push('/enlighten/thought-leadership');
            } else {
                Swal.fire('Error', result.error || 'Failed to update main page', 'error');
            }
        } catch (error: any) {
            console.error('Update main page error:', error);
            Swal.fire('Error', error.message || 'Failed to update main page', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Edit Main Page - Thought Leadership</h5>
                    <button onClick={() => router.push('/enlighten/thought-leadership')} className="btn btn-outline-primary">
                        Back to Thought Leadership
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => handleInputChange('title', e.target.value)} 
                            className="form-input w-full" 
                            required 
                        />
                    </div>

                    {/* Sub Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Sub Title</label>
                        <input 
                            type="text" 
                            value={formData.subTitle} 
                            onChange={(e) => handleInputChange('subTitle', e.target.value)} 
                            className="form-input w-full" 
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => handleInputChange('description', e.target.value)} 
                            className="form-textarea w-full" 
                            rows={4} 
                        />
                    </div>

                    {/* Editorials Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Editorials Section Title</label>
                        <input 
                            type="text" 
                            value={formData.editorialsTitle} 
                            onChange={(e) => handleInputChange('editorialsTitle', e.target.value)} 
                            className="form-input w-full" 
                            placeholder="Latest Editorials"
                        />
                    </div>

                    {/* Quote Section */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Quote Section</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea 
                                    value={formData.quote.text} 
                                    onChange={(e) => handleQuoteChange('text', e.target.value)} 
                                    className="form-textarea w-full" 
                                    rows={3} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input 
                                    type="text" 
                                    value={formData.quote.highlighted} 
                                    onChange={(e) => handleQuoteChange('highlighted', e.target.value)} 
                                    className="form-input w-full" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Call to Action Buttons</h3>
                            <button 
                                type="button" 
                                onClick={addCTA} 
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Add CTA
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.cta.map((cta, index) => (
                                <div key={index} className="border rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">CTA {index + 1}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeCTA(index)} 
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Button Text</label>
                                            <input 
                                                type="text" 
                                                value={cta.text} 
                                                onChange={(e) => handleCTAChange(index, 'text', e.target.value)} 
                                                className="form-input w-full" 
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
                                                    onChange={(e) => handleCTAChange(index, 'href', e.target.value)}
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
                                                    onChange={(e) => handleCTAChange(index, 'href', e.target.value)}
                                                    placeholder="Enter URL (e.g., /about or https://example.com)"
                                                    className="form-input w-full"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.cta.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No CTA buttons added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={() => router.push('/enlighten/thought-leadership')} 
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
};

export default EditMainPagePage;