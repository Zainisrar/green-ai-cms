'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface GreenTalentFormData {
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            headline: string;
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
    modals: {
        whyWeBuiltThis: {
            title: string;
            description: string;
            key: {
                title: string;
                items: string[];
            };
            quote: {
                text: string;
                highlighted: string;
            };
        };
        whatWeOffer: {
            title: string;
            items: Array<{
                title: string;
                description: {
                    text: string;
                    highlighted: string;
                };
            }>;
        };
        ourModel: {
            title: {
                step1: string;
                step2: string;
                step3: string;
            };
            description: string;
            key: Array<{
                title: string;
                description: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        partnerWithUs: {
            title: string;
            description: string;
            keys: Array<{
                title: string;
                description: string;
            }>;
        };
        alumniVoices: {
            title: string;
            voices: {
                text1: string;
                text2: string;
            };
        };
    };
}

const CreateGreenTalentIncubatorPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<GreenTalentFormData>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', headline: '' },
            quote1: { text: '', highlighted: '' },
            quote2: { text: '', highlighted: '' },
            cta: [],
        },
        modals: {
            whyWeBuiltThis: {
                title: '',
                description: '',
                key: { title: '', items: [] },
                quote: { text: '', highlighted: '' },
            },
            whatWeOffer: {
                title: '',
                items: [],
            },
            ourModel: {
                title: { step1: '', step2: '', step3: '' },
                description: '',
                key: [],
                quote: { text: '', highlighted: '' },
            },
            partnerWithUs: {
                title: '',
                description: '',
                keys: [],
            },
            alumniVoices: {
                title: '',
                voices: { text1: '', text2: '' },
            },
        },
    });

    const handleInputChange = (section: 'mainPage' | 'modals', field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
        if (errors[`${section}.${field}`]) {
            setErrors((prev) => ({ ...prev, [`${section}.${field}`]: '' }));
        }
    };

    const handleNestedChange = (section: 'mainPage' | 'modals', parent: string, field: string, value: string) => {
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
            const result = await apiClient.post('/api/empower/green-talent-incubator', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Green Talent Incubator created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/green-talent-incubator');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create green talent incubator', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create green talent incubator', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Green Talent Incubator</h5>
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
                                    <label className="block text-sm font-medium mb-2">Description Headline</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Headline text"
                                        value={formData.mainPage.description.headline}
                                        onChange={(e) => handleNestedChange('mainPage', 'description', 'headline', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Placeholders */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Modal Content</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Why We Built This</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.whyWeBuiltThis.title}
                                    onChange={(e) => handleNestedChange('modals', 'whyWeBuiltThis', 'title', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">What We Offer</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.whatWeOffer.title}
                                    onChange={(e) => handleNestedChange('modals', 'whatWeOffer', 'title', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Our Model</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Description"
                                    value={formData.modals.ourModel.description}
                                    onChange={(e) => handleNestedChange('modals', 'ourModel', 'description', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Partner With Us</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.partnerWithUs.title}
                                    onChange={(e) => handleNestedChange('modals', 'partnerWithUs', 'title', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Alumni Voices</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.alumniVoices.title}
                                    onChange={(e) => handleNestedChange('modals', 'alumniVoices', 'title', e.target.value)}
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
                            {loading ? 'Creating...' : 'Create Green Talent Incubator'}
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

export default CreateGreenTalentIncubatorPage;