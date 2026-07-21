'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface InvestorRelationsFormData {
    mainPage: {
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
    };
    whyInvestGreen: {
        title: string;
        headline: string;
        key: Array<{
            icon: {
                src: string;
                alt: string;
            };
            text: string;
        }>;
        quote: {
            text: string;
            highlighted: string;
        };
    };
    investmentInstruments: {
        title: string;
        headline: string;
        key: Array<{
            icon: {
                src: string;
                alt: string;
            };
            text: string;
        }>;
        quote: {
            text: string;
            highlighted: string;
        };
    };
    investmentFocusArea: {
        title: string;
        headline: string;
        focusArea: {
            items: string[];
        };
        capitalUse: {
            items: string[];
        };
        returnProfile: {
            items: string[];
        };
    };
    performanceSnapshots: {
        title: string;
        headline: string;
        metric: {
            items: string[];
        };
        value: {
            items: string[];
        };
    };
}

const CreateInvestorRelationsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<InvestorRelationsFormData>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote1: { text: '', highlighted: '' },
            quote2: { text: '', highlighted: '' },
            cta: [],
        },
        whyInvestGreen: {
            title: '',
            headline: '',
            key: [],
            quote: { text: '', highlighted: '' },
        },
        investmentInstruments: {
            title: '',
            headline: '',
            key: [],
            quote: { text: '', highlighted: '' },
        },
        investmentFocusArea: {
            title: '',
            headline: '',
            focusArea: { items: [] },
            capitalUse: { items: [] },
            returnProfile: { items: [] },
        },
        performanceSnapshots: {
            title: '',
            headline: '',
            metric: { items: [] },
            value: { items: [] },
        },
    });

    const handleInputChange = (section: keyof InvestorRelationsFormData, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
        if (errors[`${section}.${field}`]) {
            setErrors((prev) => ({ ...prev, [`${section}.${field}`]: '' }));
        }
    };

    const handleNestedChange = (section: keyof InvestorRelationsFormData, parent: string, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [parent]: { ...(prev[section] as any)[parent], [field]: value },
            },
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.mainPage.title.trim()) {
            newErrors['mainPage.title'] = 'Title is required';
        }

        if (!formData.mainPage.subHeadline.trim()) {
            newErrors['mainPage.subHeadline'] = 'Sub-headline is required';
        }

        if (!formData.mainPage.description.text.trim()) {
            newErrors['mainPage.description'] = 'Description text is required';
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
            const result = await apiClient.post('/api/engage/investor-relations', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Investor Relations page created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/engage/investor-relations');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create investor relations page', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create investor relations page', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Investor Relations</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Page Section */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Main Page Content</h6>
                        
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter title"
                                        value={formData.mainPage.title}
                                        onChange={(e) => handleInputChange('mainPage', 'title', e.target.value)}
                                    />
                                    {errors['mainPage.title'] && <p className="text-red-500 text-sm mt-1">{errors['mainPage.title']}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Sub-Headline *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter sub-headline"
                                        value={formData.mainPage.subHeadline}
                                        onChange={(e) => handleInputChange('mainPage', 'subHeadline', e.target.value)}
                                    />
                                    {errors['mainPage.subHeadline'] && <p className="text-red-500 text-sm mt-1">{errors['mainPage.subHeadline']}</p>}
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
                                        value={formData.mainPage.description.text}
                                        onChange={(e) => handleNestedChange('mainPage', 'description', 'text', e.target.value)}
                                    />
                                    {errors['mainPage.description'] && <p className="text-red-500 text-sm mt-1">{errors['mainPage.description']}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description Highlighted</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Highlighted text"
                                        value={formData.mainPage.description.highlighted}
                                        onChange={(e) => handleNestedChange('mainPage', 'description', 'highlighted', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Quotes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quote 1 Text</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Enter first quote"
                                        value={formData.mainPage.quote1.text}
                                        onChange={(e) => handleNestedChange('mainPage', 'quote1', 'text', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quote 1 Highlighted</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Highlighted text in quote 1"
                                        value={formData.mainPage.quote1.highlighted}
                                        onChange={(e) => handleNestedChange('mainPage', 'quote1', 'highlighted', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quote 2 Text</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Enter second quote"
                                        value={formData.mainPage.quote2.text}
                                        onChange={(e) => handleNestedChange('mainPage', 'quote2', 'text', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quote 2 Highlighted</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Highlighted text in quote 2"
                                        value={formData.mainPage.quote2.highlighted}
                                        onChange={(e) => handleNestedChange('mainPage', 'quote2', 'highlighted', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Placeholders */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Modal Content</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Why Invest Green</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.whyInvestGreen.title}
                                    onChange={(e) => handleInputChange('whyInvestGreen', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Headline"
                                    value={formData.whyInvestGreen.headline}
                                    onChange={(e) => handleInputChange('whyInvestGreen', 'headline', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Investment Instruments</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.investmentInstruments.title}
                                    onChange={(e) => handleInputChange('investmentInstruments', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Headline"
                                    value={formData.investmentInstruments.headline}
                                    onChange={(e) => handleInputChange('investmentInstruments', 'headline', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Investment Focus Area</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.investmentFocusArea.title}
                                    onChange={(e) => handleInputChange('investmentFocusArea', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Headline"
                                    value={formData.investmentFocusArea.headline}
                                    onChange={(e) => handleInputChange('investmentFocusArea', 'headline', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Performance Snapshots</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.performanceSnapshots.title}
                                    onChange={(e) => handleInputChange('performanceSnapshots', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Headline"
                                    value={formData.performanceSnapshots.headline}
                                    onChange={(e) => handleInputChange('performanceSnapshots', 'headline', e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Note:</strong> You can create the basic structure here and edit individual modals in detail after creation.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Creating...' : 'Create Investor Relations'}
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

export default CreateInvestorRelationsPage;