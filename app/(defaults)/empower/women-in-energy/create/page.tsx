'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface WomenInEnergyFormData {
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
    modal: {
        whyThisMatters: {
            title: string;
            subHeadline: string;
            description: string;
            img: {
                src: string;
                alt: string;
            };
            keys: string[];
            quote: {
                text: string;
                highlighted: string;
            };
        };
        initiativesUnderway: {
            title: string;
            subHeadline: string;
            key: Array<{
                program: string;
                description: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        voicesOfPower: {
            title: string;
            items: Array<{
                img: {
                    src: string;
                    alt: string;
                };
                title: string;
                description: string;
            }>;
        };
        partnerWithUs: {
            title: string;
            description: string;
            keys: string[];
            quote: {
                text: string;
                highlighted: string;
            };
            img: {
                src: string;
                alt: string;
            };
        };
    };
}

const CreateWomenInEnergyPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<WomenInEnergyFormData>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote1: { text: '', highlighted: '' },
            quote2: { text: '', highlighted: '' },
            cta: [],
        },
        modal: {
            whyThisMatters: {
                title: '',
                subHeadline: '',
                description: '',
                img: { src: '', alt: '' },
                keys: [],
                quote: { text: '', highlighted: '' },
            },
            initiativesUnderway: {
                title: '',
                subHeadline: '',
                key: [],
                quote: { text: '', highlighted: '' },
            },
            voicesOfPower: {
                title: '',
                items: [],
            },
            partnerWithUs: {
                title: '',
                description: '',
                keys: [],
                quote: { text: '', highlighted: '' },
                img: { src: '', alt: '' },
            },
        },
    });

    const handleInputChange = (section: 'mainPage' | 'modal', field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
        if (errors[`${section}.${field}`]) {
            setErrors((prev) => ({ ...prev, [`${section}.${field}`]: '' }));
        }
    };

    const handleNestedChange = (section: 'mainPage' | 'modal', parent: string, field: string, value: string) => {
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
            const result = await apiClient.post('/api/empower/women-in-energy', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Women in Energy page created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/women-in-energy');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create women in energy page', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create women in energy page', 'error');
        } finally {
            setLoading(false);
        }
    };

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
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Women in Energy</h5>
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
                        </div>
                    </div>

                    {/* Modal Placeholders */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Modal Content</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Why This Matters</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.whyThisMatters.title}
                                    onChange={(e) => handleNestedChange('modal', 'whyThisMatters', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modal.whyThisMatters.subHeadline}
                                    onChange={(e) => handleNestedChange('modal', 'whyThisMatters', 'subHeadline', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Initiatives Underway</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.initiativesUnderway.title}
                                    onChange={(e) => handleNestedChange('modal', 'initiativesUnderway', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modal.initiativesUnderway.subHeadline}
                                    onChange={(e) => handleNestedChange('modal', 'initiativesUnderway', 'subHeadline', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Voices of Power</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modal.voicesOfPower.title}
                                    onChange={(e) => handleNestedChange('modal', 'voicesOfPower', 'title', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Partner With Us</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.partnerWithUs.title}
                                    onChange={(e) => handleNestedChange('modal', 'partnerWithUs', 'title', e.target.value)}
                                />
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    placeholder="Description"
                                    value={formData.modal.partnerWithUs.description}
                                    onChange={(e) => handleNestedChange('modal', 'partnerWithUs', 'description', e.target.value)}
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
                            {loading ? 'Creating...' : 'Create Women in Energy'}
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

export default CreateWomenInEnergyPage;