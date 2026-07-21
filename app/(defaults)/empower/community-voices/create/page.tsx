'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface CommunityVoicesFormData {
    mainPage: {
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
        }>; // CHANGED to array per schema update
        modals: Array<{
            img: {
                src: string;
                alt: string;
            };
            cta: string;
        }>;
    };
    modals: {
        voicesFromField: {
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
        whatMakesOurImpactDifferent: {
            title: string;
            key1: {
                title: string;
                items: string[];
            };
            key2: {
                title: string;
                items: string[];
            };
        };
    };
}

const CreateCommunityVoicesPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<CommunityVoicesFormData>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote1: { text1: '', highlighted1: '', text2: '', highlighted2: '' },
            quote2: { text: '', highlighted: '' },
            cta: [],
            modals: [],
        },
        modals: {
            voicesFromField: {
                title: '',
                items: [],
            },
            whatMakesOurImpactDifferent: {
                title: '',
                key1: { title: '', items: [] },
                key2: { title: '', items: [] },
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

    // CTA array handlers
    const addCta = () => {
        setFormData(prev => ({
            ...prev,
            mainPage: { ...prev.mainPage, cta: [...prev.mainPage.cta, { text: '', href: '' }] }
        }));
    };
    const updateCta = (index: number, field: 'text' | 'href', value: string) => {
        setFormData(prev => ({
            ...prev,
            mainPage: {
                ...prev.mainPage,
                cta: prev.mainPage.cta.map((c, i) => i === index ? { ...c, [field]: value } : c)
            }
        }));
    };
    const removeCta = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mainPage: { ...prev.mainPage, cta: prev.mainPage.cta.filter((_, i) => i !== index) }
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
            const result = await apiClient.post('/api/empower/community-voices', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Community Voices page created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/community-voices');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create community voices page', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create community voices page', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Community Voices</h5>
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

                            {/* CTA ARRAY */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h6 className="text-sm font-semibold">Call-to-Action Buttons</h6>
                                    <button type="button" onClick={addCta} className="btn btn-xs btn-outline-primary border-green-600 text-green-600 hover:bg-green-600">Add CTA</button>
                                </div>
                                {formData.mainPage.cta.length === 0 ? (
                                    <p className="text-xs text-gray-500">No CTAs added yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.mainPage.cta.map((cta, idx) => (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Text</label>
                                                    <input type="text" className="form-input" value={cta.text} onChange={(e) => updateCta(idx, 'text', e.target.value)} placeholder={`CTA text ${idx + 1}`} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">URL</label>
                                                    <input type="url" className="form-input" value={cta.href} onChange={(e) => updateCta(idx, 'href', e.target.value)} placeholder="https://..." />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => removeCta(idx)} className="btn btn-outline-danger btn-sm w-full">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modal Placeholders */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Modal Content</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Voices From Field</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.voicesFromField.title}
                                    onChange={(e) => handleNestedChange('modals', 'voicesFromField', 'title', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">What Makes Our Impact Different</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modals.whatMakesOurImpactDifferent.title}
                                    onChange={(e) => handleNestedChange('modals', 'whatMakesOurImpactDifferent', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Key 1 title"
                                    value={formData.modals.whatMakesOurImpactDifferent.key1.title}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            modals: {
                                                ...prev.modals,
                                                whatMakesOurImpactDifferent: {
                                                    ...prev.modals.whatMakesOurImpactDifferent,
                                                    key1: {
                                                        ...prev.modals.whatMakesOurImpactDifferent.key1,
                                                        title: e.target.value
                                                    }
                                                }
                                            }
                                        }));
                                    }}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Key 2 title"
                                    value={formData.modals.whatMakesOurImpactDifferent.key2.title}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            modals: {
                                                ...prev.modals,
                                                whatMakesOurImpactDifferent: {
                                                    ...prev.modals.whatMakesOurImpactDifferent,
                                                    key2: {
                                                        ...prev.modals.whatMakesOurImpactDifferent.key2,
                                                        title: e.target.value
                                                    }
                                                }
                                            }
                                        }));
                                    }}
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
                            {loading ? 'Creating...' : 'Create Community Voices'}
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

export default CreateCommunityVoicesPage;