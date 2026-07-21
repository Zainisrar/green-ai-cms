'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

// Flatten navigation items for dropdown with proper hierarchy display
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

interface CareersCTA {
    text: string;
    href: string;
}

interface CareersDescription {
    text: string;
    highlighted: string;
}

interface CareersQuote {
    text: string;
    highlighted: string;
}

interface CareersKey {
    text: string;
    cta: {
        text: string;
    };
}

interface CareersMainPage {
    title: string;
    subHeadline: string;
    description: CareersDescription;
    quote1: CareersQuote;
    quote2: CareersQuote;
    keys: CareersKey[];
    cta: CareersCTA[];
}

const EditMainPagePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [careersId, setCareersId] = useState<number | null>(null);
    const [otherData, setOtherData] = useState<any>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<('navigation' | 'manual')[]>([]);
    const [keyButtonLinkTypes, setKeyButtonLinkTypes] = useState<('navigation' | 'manual')[]>([]);

    const [formData, setFormData] = useState<CareersMainPage>({
        title: '',
        subHeadline: '',
        description: { text: '', highlighted: '' },
        quote1: { text: '', highlighted: '' },
        quote2: { text: '', highlighted: '' },
        keys: [],
        cta: [],
    });

    // Fetch navigation items for dropdown
    const { data: navigationData } = useQuery({
        queryKey: ['navigation'],
        queryFn: async () => {
            const result = await apiClient.get('/api/navigation');
            return result.data || [];
        }
    });

    const flatNavigationItems = navigationData ? flattenNavItems(navigationData) : [];

    useEffect(() => {
        fetchMainPageData();
    }, []);

    const fetchMainPageData = async () => {
        try {
            const result = await apiClient.get('/api/empower/careers-at-green');
            if (result.success && result.data?.mainPage) {
                const mainPageData = result.data.mainPage;
                setFormData({
                    ...mainPageData,
                    cta: Array.isArray(mainPageData.cta) ? mainPageData.cta : [],
                    keys: Array.isArray(mainPageData.keys) ? mainPageData.keys : [],
                });
                
                // Initialize link types based on existing hrefs
                if (Array.isArray(mainPageData.cta)) {
                    setCtaLinkTypes(mainPageData.cta.map((cta: CareersCTA) => 
                        (cta.href && cta.href.startsWith('/')) ? 'navigation' : 'manual'
                    ));
                }
                
                setCareersId(result.data.id);
                setOtherData({
                    whyWorkWithGreenModal: result.data.whyWorkWithGreenModal,
                    careerTrackSupport: result.data.careerTrackSupport,
                    whatMakesGreenDifferent: result.data.whatMakesGreenDifferent,
                    openRoles: result.data.openRoles,
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
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: 'description' | 'quote1' | 'quote2', field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value },
        }));
    };

    const addKey = () => {
        setFormData((prev) => ({
            ...prev,
            keys: [...prev.keys, { text: '', cta: { text: '' } }],
        }));
    };

    const addCTA = () => {
        setFormData((prev) => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }],
        }));
        setCtaLinkTypes((prev) => [...prev, 'navigation']);
    };

    const updateKey = (index: number, field: 'text', value: string) => {
        setFormData((prev) => ({
            ...prev,
            keys: prev.keys.map((key, i) => (i === index ? { ...key, [field]: value } : key)),
        }));
    };

    const updateKeyCTA = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            keys: prev.keys.map((key, i) => (i === index ? { ...key, cta: { text: value } } : key)),
        }));
    };

    const updateCTA = (index: number, field: 'text' | 'href', value: string) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.map((cta, i) => (i === index ? { ...cta, [field]: value } : cta)),
        }));
    };

    const removeCTA = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            cta: prev.cta.filter((_, i) => i !== index),
        }));
        setCtaLinkTypes((prev) => prev.filter((_, i) => i !== index));
    };

    const removeKey = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            keys: prev.keys.filter((_, i) => i !== index),
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
            const payload = {
                id: careersId,
                mainPage: formData,
                whyWorkWithGreenModal: otherData?.whyWorkWithGreenModal || {
                    title: '',
                    description: '',
                    icons: [],
                    quote: { text1: '', text2: '', highlighted1: '', highlighted2: '' },
                },
                careerTrackSupport: otherData?.careerTrackSupport || {
                    title: '',
                    role: [],
                },
                whatMakesGreenDifferent: otherData?.whatMakesGreenDifferent || {
                    title: '',
                    featuredImg: { src: '', alt: '' },
                    keyPoints: [],
                },
                openRoles: otherData?.openRoles || {
                    title: '',
                    roles: [],
                },
            };

            const result = careersId ? await apiClient.put('/api/empower/careers-at-green', payload) : await apiClient.post('/api/empower/careers-at-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Main page updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/careers-at-green');
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
                        <button onClick={() => router.back()} className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600">
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Careers Main Page</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input type="text" className="form-input" placeholder="Enter main page title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
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
                            <label className="block text-sm font-medium mb-2">Description Text</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
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
                                placeholder="Highlighted part"
                                value={formData.description.highlighted}
                                onChange={(e) => handleNestedChange('description', 'highlighted', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Quotes */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Quotes</h4>

                        {/* Quote 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 1 Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter quote 1"
                                    value={formData.quote1.text}
                                    onChange={(e) => handleNestedChange('quote1', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 1 Highlighted</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted part"
                                    value={formData.quote1.highlighted}
                                    onChange={(e) => handleNestedChange('quote1', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Quote 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote 2 Text</label>
                                <input
                                    type="text"
                                    className="form-input"
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

                    {/* Main CTAs */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Main Call-to-Action Buttons</label>
                            <button type="button" onClick={addCTA} className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">
                                Add CTA
                            </button>
                        </div>

                        {!Array.isArray(formData.cta) || formData.cta.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No CTA buttons added yet. Click "Add CTA" to create one.</div>
                        ) : (
                            <div className="space-y-4">
                                {formData.cta.map((cta, index) => (
                                    <div key={index} className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Button Text</label>
                                            <input type="text" className="form-input" placeholder="Button text" value={cta.text} onChange={(e) => updateCTA(index, 'text', e.target.value)} />
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
                                            <label className="block text-sm font-medium mb-2">Button URL</label>
                                            <div className="flex gap-2">
                                                {ctaLinkTypes[index] === 'navigation' ? (
                                                    <select
                                                        className="form-select flex-1"
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
                                                        className="form-input flex-1"
                                                        placeholder="https://example.com"
                                                        value={cta.href}
                                                        onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                    />
                                                )}
                                                <button type="button" onClick={() => removeCTA(index)} className="btn btn-sm btn-outline-danger" title="Remove CTA">
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Key Features */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Key Features</label>
                            <button type="button" onClick={addKey} className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">
                                Add Key Feature
                            </button>
                        </div>

                        {formData.keys.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No key features added yet. Click "Add Key Feature" to create one.</div>
                        ) : (
                            <div className="space-y-4">
                                {formData.keys.map((key, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-semibold">Key Feature {index + 1}</h5>
                                            <button type="button" onClick={() => removeKey(index)} className="btn btn-sm btn-outline-danger" title="Remove Key Feature">
                                                ×
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Text</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={2}
                                                placeholder="Feature description"
                                                value={key.text}
                                                onChange={(e) => updateKey(index, 'text', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">CTA Text</label>
                                            <input type="text" className="form-input" placeholder="Button text" value={key.cta.text} onChange={(e) => updateKeyCTA(index, e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                            {loading ? 'Saving...' : 'Save Main Page'}
                        </button>
                        <button type="button" onClick={() => router.back()} className="btn btn-outline-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
};

export default EditMainPagePage;
