'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

interface TeamGreenCTA {
    text: string;
    href: string;
}

interface TeamGreenDescription {
    text: string;
    highlighted: string;
}

interface TeamGreenQuote {
    text: string;
    highlighted: string;
}

interface TeamGreenKey {
    title: string;
    description: string;
    button: TeamGreenCTA;
}

interface TeamGreenMainPage {
    title: string;
    subHeadline: string;
    description: TeamGreenDescription;
    quote1: TeamGreenQuote;
    quote2: TeamGreenQuote;
    cta: TeamGreenCTA[];
    keys: TeamGreenKey[];
}

const EditMainPagePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [teamGreenId, setTeamGreenId] = useState<number | null>(null);
    const [otherData, setOtherData] = useState<any>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    const [keyButtonLinkTypes, setKeyButtonLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});
    
    // Fetch navigation items for dropdowns
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
    
    const [formData, setFormData] = useState<TeamGreenMainPage>({
        title: '',
        subHeadline: '',
        description: { text: '', highlighted: '' },
        quote1: { text: '', highlighted: '' },
        quote2: { text: '', highlighted: '' },
        cta: [],
        keys: []
    });

    useEffect(() => {
        fetchMainPageData();
    }, []);

    const fetchMainPageData = async () => {
        try {
            const result = await apiClient.get('/api/empower/team-green');
            if (result.success && result.data?.mainPage) {
                setFormData(result.data.mainPage);
                setTeamGreenId(result.data.id);
                setOtherData({
                    whoWeAreModal: result.data.whoWeAreModal,
                    ourLeadershipPhilosophy: result.data.ourLeadershipPhilosophy,
                    meetTeam: result.data.meetTeam,
                    ourCultureActionModal: result.data.ourCultureActionModal
                });
                
                // Initialize link types
                const ctaTypes: { [key: number]: 'navigation' | 'manual' } = {};
                result.data.mainPage.cta?.forEach((_: any, index: number) => {
                    ctaTypes[index] = 'navigation';
                });
                setCtaLinkTypes(ctaTypes);

                const keyTypes: { [key: number]: 'navigation' | 'manual' } = {};
                result.data.mainPage.keys?.forEach((_: any, index: number) => {
                    keyTypes[index] = 'navigation';
                });
                setKeyButtonLinkTypes(keyTypes);
            } else {
                // Initialize with default values if no data exists
                setFormData({
                    title: 'Team Green',
                    subHeadline: 'Our Amazing Team',
                    description: { text: 'Meet the passionate individuals driving green energy innovation', highlighted: 'innovation' },
                    quote1: { text: 'Together we build a sustainable future', highlighted: 'sustainable future' },
                    quote2: { text: 'Innovation through collaboration', highlighted: 'collaboration' },
                    cta: [],
                    keys: []
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

    const handleNestedChange = (parent: 'description' | 'quote1' | 'quote2', field: 'text' | 'highlighted', value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const addCTA = () => {
        const newIndex = formData.cta.length;
        setCtaLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setFormData(prev => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }]
        }));
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
    };

    const addKey = () => {
        const newIndex = formData.keys.length;
        setKeyButtonLinkTypes(prev => ({ ...prev, [newIndex]: 'navigation' }));
        setFormData(prev => ({
            ...prev,
            keys: [...prev.keys, { title: '', description: '', button: { text: '', href: '' } }]
        }));
    };

    const updateKey = (index: number, field: 'title' | 'description', value: string) => {
        setFormData(prev => ({
            ...prev,
            keys: prev.keys.map((key, i) => i === index ? { ...key, [field]: value } : key)
        }));
    };

    const updateKeyButton = (index: number, field: 'text' | 'href', value: string) => {
        setFormData(prev => ({
            ...prev,
            keys: prev.keys.map((key, i) => i === index ? { ...key, button: { ...key.button, [field]: value } } : key)
        }));
    };

    const removeKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keys: prev.keys.filter((_, i) => i !== index)
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
                id: teamGreenId,
                mainPage: formData,
                whoWeAreModal: otherData?.whoWeAreModal || {
                    title: 'Who We Are',
                    description: 'Default description',
                    img: { src: '', alt: '', highlighted: '' },
                    title2: 'Our Mission',
                    description2: 'Default mission',
                    quote: { text: 'Default quote', highlighted: 'quote' }
                },
                ourLeadershipPhilosophy: otherData?.ourLeadershipPhilosophy || {
                    title: 'Leadership Philosophy',
                    description: 'Default philosophy',
                    icon: [],
                    quote: { text: 'Default quote', highlighted: 'quote' }
                },
                meetTeam: otherData?.meetTeam || {
                    title: 'Meet Our Team',
                    description: 'Default description',
                    quote: { text1: 'Default', text2: 'quote', highlighted: 'team' },
                    jobTitle: []
                },
                ourCultureActionModal: otherData?.ourCultureActionModal || {
                    title: 'Our Culture',
                    description: 'Default culture',
                    img: { src: '', alt: '' },
                    keys: [],
                    quote: { text: 'Default quote', highlighted: 'culture' }
                }
            };

            const result = teamGreenId 
                ? await apiClient.put('/api/empower/team-green', payload)
                : await apiClient.post('/api/empower/team-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Main page updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/empower/team-green');
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
                   {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter main page title"
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

                    {/* CTA Buttons */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Call-to-Action Buttons</label>
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
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Button Text</label>
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
                                            <div className="flex gap-4 mb-2">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={ctaLinkTypes[index] === 'navigation'}
                                                        onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'navigation' }))}
                                                        className="form-radio"
                                                    />
                                                    <span className="text-xs">Navigation Item</span>
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={ctaLinkTypes[index] === 'manual'}
                                                        onChange={() => setCtaLinkTypes(prev => ({ ...prev, [index]: 'manual' }))}
                                                        className="form-radio"
                                                    />
                                                    <span className="text-xs">Manual URL</span>
                                                </label>
                                            </div>
                                            <div className="flex gap-2">
                                                {ctaLinkTypes[index] === 'navigation' ? (
                                                    <select
                                                        value={cta.href}
                                                        onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                        className="form-select flex-1"
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
                                                        className="form-input flex-1"
                                                        placeholder="https://example.com or /path"
                                                        value={cta.href}
                                                        onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCTA(index)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Remove CTA"
                                                >
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
                            <button
                                type="button"
                                onClick={addKey}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add Key Feature
                            </button>
                        </div>
                        
                        {formData.keys.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No key features added yet. Click "Add Key Feature" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.keys.map((key, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Feature title"
                                                    value={key.title}
                                                    onChange={(e) => updateKey(index, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={2}
                                                    placeholder="Feature description"
                                                    value={key.description}
                                                    onChange={(e) => updateKey(index, 'description', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Button Text</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Button text"
                                                    value={key.button.text}
                                                    onChange={(e) => updateKeyButton(index, 'text', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Link Type</label>
                                                <div className="flex gap-4 mb-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            checked={keyButtonLinkTypes[index] === 'navigation'}
                                                            onChange={() => setKeyButtonLinkTypes(prev => ({ ...prev, [index]: 'navigation' }))}
                                                            className="form-radio"
                                                        />
                                                        <span className="text-xs">Navigation Item</span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            checked={keyButtonLinkTypes[index] === 'manual'}
                                                            onChange={() => setKeyButtonLinkTypes(prev => ({ ...prev, [index]: 'manual' }))}
                                                            className="form-radio"
                                                        />
                                                        <span className="text-xs">Manual URL</span>
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    {keyButtonLinkTypes[index] === 'navigation' ? (
                                                        <select
                                                            value={key.button.href}
                                                            onChange={(e) => updateKeyButton(index, 'href', e.target.value)}
                                                            className="form-select flex-1"
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
                                                            className="form-input flex-1"
                                                            placeholder="https://example.com or /path"
                                                            value={key.button.href}
                                                            onChange={(e) => updateKeyButton(index, 'href', e.target.value)}
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeKey(index)}
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Remove Key Feature"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
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
        </ProtectedRoute>
    );
};

export default EditMainPagePage;