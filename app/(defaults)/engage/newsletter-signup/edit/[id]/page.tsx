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

interface NewsletterSignupFormData {
    title: string;
    subHeadline: string;
    description: {
        text: string;
        highlighted: string;
    };
    whySubscribe: {
        benefit: string;
        description: string;
    }[];
    contact: string;
    whatYouReceive: string[];
    quote: {
        text: string;
        highlighted: string;
    };
    cta: {
        text: string;
        href: string;
    }[];
}

const EditNewsletterSignupPage = () => {
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
    
    const [formData, setFormData] = useState<NewsletterSignupFormData>({
        title: '',
        subHeadline: '',
        description: { text: '', highlighted: '' },
        whySubscribe: [],
        contact: '',
        whatYouReceive: [],
        quote: { text: '', highlighted: '' },
        cta: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/newsletter-signup/${id}`);
            if (result.success) {
                const data = result.data;
                setFormData(data);
                
                if (Array.isArray(data.cta)) {
                    setCtaLinkTypes(data.cta.map((cta: any) => 
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

    const handleInputChange = (field: keyof NewsletterSignupFormData, value: string) => {
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

    // Why Subscribe Management
    const addWhySubscribe = () => {
        setFormData(prev => ({
            ...prev,
            whySubscribe: [...prev.whySubscribe, { benefit: '', description: '' }]
        }));
    };

    const removeWhySubscribe = (index: number) => {
        setFormData(prev => ({
            ...prev,
            whySubscribe: prev.whySubscribe.filter((_, i) => i !== index)
        }));
    };

    const handleWhySubscribeChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            whySubscribe: prev.whySubscribe.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    // What You Receive Management
    const addWhatYouReceive = () => {
        setFormData(prev => ({
            ...prev,
            whatYouReceive: [...prev.whatYouReceive, '']
        }));
    };

    const removeWhatYouReceive = (index: number) => {
        setFormData(prev => ({
            ...prev,
            whatYouReceive: prev.whatYouReceive.filter((_, i) => i !== index)
        }));
    };

    const handleWhatYouReceiveChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            whatYouReceive: prev.whatYouReceive.map((item, i) => 
                i === index ? value : item
            )
        }));
    };

    // CTA Management
    const addCTA = () => {
        setFormData(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
        setCtaLinkTypes(prev => [...prev, 'navigation']);
    };

    const removeCTA = (index: number) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index)
        }));
        setCtaLinkTypes(prev => prev.filter((_, i) => i !== index));
    };

    const handleCTAChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            cta: prev.cta.map((cta, i) => 
                i === index ? { ...cta, [field]: value } : cta
            )
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
            const result = await apiClient.patch(`/api/engage/newsletter-signup/${id}`, formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Newsletter signup data updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/newsletter-signup');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update newsletter signup data', 'error');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire('Error', error.message || 'Failed to update newsletter signup data', 'error');
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
                            onClick={() => router.push('/engage/newsletter-signup')}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Newsletter Signup</h5>
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

                        <div className="mt-6">
                            <label className="block text-sm font-medium mb-2">Contact</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter contact information"
                                value={formData.contact}
                                onChange={(e) => handleInputChange('contact', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Description</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Description Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Enter description"
                                    value={formData.description.text}
                                    onChange={(e) => handleNestedChange('description', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Text to highlight"
                                    value={formData.description.highlighted}
                                    onChange={(e) => handleNestedChange('description', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Quote</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Enter quote text"
                                    value={formData.quote.text}
                                    onChange={(e) => handleNestedChange('quote', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Text to highlight in quote"
                                    value={formData.quote.highlighted}
                                    onChange={(e) => handleNestedChange('quote', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Why Subscribe */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Why Subscribe</h6>
                            <button
                                type="button"
                                onClick={addWhySubscribe}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add Benefit
                            </button>
                        </div>

                        {formData.whySubscribe.map((item, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-medium">Benefit {index + 1}</h6>
                                    <button
                                        type="button"
                                        onClick={() => removeWhySubscribe(index)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Benefit</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter benefit"
                                            value={item.benefit}
                                            onChange={(e) => handleWhySubscribeChange(index, 'benefit', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="Enter description"
                                            value={item.description}
                                            onChange={(e) => handleWhySubscribeChange(index, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.whySubscribe.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No benefits added yet. Click "Add Benefit" to get started.
                            </div>
                        )}
                    </div>

                    {/* What You Receive */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">What You Receive</h6>
                            <button
                                type="button"
                                onClick={addWhatYouReceive}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add Item
                            </button>
                        </div>

                        {formData.whatYouReceive.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter what subscribers receive"
                                        value={item}
                                        onChange={(e) => handleWhatYouReceiveChange(index, e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeWhatYouReceive(index)}
                                    className="btn btn-outline-danger btn-sm"
                                >
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {formData.whatYouReceive.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No items added yet. Click "Add Item" to get started.
                            </div>
                        )}
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
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add CTA
                            </button>
                        </div>

                        {formData.cta.map((cta, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-medium">CTA {index + 1}</h6>
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
                                            onChange={(e) => handleCTAChange(index, 'text', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Link Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`linkType-${index}`}
                                                    checked={ctaLinkTypes[index] === 'navigation'}
                                                    onChange={() => {
                                                        const newTypes = [...ctaLinkTypes];
                                                        newTypes[index] = 'navigation';
                                                        setCtaLinkTypes(newTypes);
                                                        handleCTAChange(index, 'href', '');
                                                    }}
                                                    className="form-radio text-green-600"
                                                />
                                                <span className="ml-2">Navigation Item</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`linkType-${index}`}
                                                    checked={ctaLinkTypes[index] === 'manual'}
                                                    onChange={() => {
                                                        const newTypes = [...ctaLinkTypes];
                                                        newTypes[index] = 'manual';
                                                        setCtaLinkTypes(newTypes);
                                                        handleCTAChange(index, 'href', '');
                                                    }}
                                                    className="form-radio text-green-600"
                                                />
                                                <span className="ml-2">Manual URL</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        {ctaLinkTypes[index] === 'navigation' ? (
                                            <>
                                                <label className="block text-sm font-medium mb-2">Select Navigation Item</label>
                                                <select
                                                    className="form-select"
                                                    value={cta.href}
                                                    onChange={(e) => handleCTAChange(index, 'href', e.target.value)}
                                                >
                                                    <option value="">Select a navigation item</option>
                                                    {flatNavigationItems.map((item) => (
                                                        <option key={item.id} value={item.path}>
                                                            {item.displayName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        ) : (
                                            <>
                                                <label className="block text-sm font-medium mb-2">Button Link</label>
                                                <input
                                                    type="url"
                                                    className="form-input"
                                                    placeholder="https://example.com"
                                                    value={cta.href}
                                                    onChange={(e) => handleCTAChange(index, 'href', e.target.value)}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.cta.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No CTA buttons added yet. Click "Add CTA" to get started.
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
                            {loading ? 'Updating...' : 'Update Newsletter Signup'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/engage/newsletter-signup')}
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

export default EditNewsletterSignupPage;