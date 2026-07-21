'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface PublicEventsVolunteeringFormData {
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            highlighted: string;
        };
        quote: {
            text: string;
            highlighted: string;
        };
        cta: Array<{
            text: string;
            href: string;
        }>;
    };
    modals: {
        whyWeEngage: {
            title: string;
            subHeadline: string;
            img: {
                src: string;
                alt: string;
            };
            quote: {
                text: string;
                highlighted: string;
            };
            content: string;
        };
        waysGetInvolved: {
            title: string;
            download: {
                text: string;
                href: string;
            };
            items: Array<{
                title: string;
                description: string;
                cta: {
                    text: string;
                    href: string;
                };
                img: {
                    src: string;
                    alt: string;
                };
            }>;
        };
        whoCanJoin: {
            title: string;
            items: Array<{
                title: string;
                description: string;
                optionalimg: {
                    src: string;
                    alt: string;
                };
            }>;
        };
        volunteerSignUp: {
            title: string;
            items: Array<{
                step: string;
                action: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        pastHighlights: {
            title: string;
            items: Array<{
                img: {
                    src: string;
                    alt: string;
                };
                title: string;
                description: string;
                year: string;
            }>;
            browse: {
                text: string;
                highlighted: string;
            };
        };
    };
}

const CreatePublicEventsVolunteeringPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<PublicEventsVolunteeringFormData>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote: { text: '', highlighted: '' },
            cta: [],
        },
        modals: {
            whyWeEngage: {
                title: '',
                subHeadline: '',
                img: { src: '', alt: '' },
                quote: { text: '', highlighted: '' },
                content: '',
            },
            waysGetInvolved: {
                title: '',
                download: { text: '', href: '' },
                items: [],
            },
            whoCanJoin: {
                title: '',
                items: [],
            },
            volunteerSignUp: {
                title: '',
                items: [],
                quote: { text: '', highlighted: '' },
            },
            pastHighlights: {
                title: '',
                items: [],
                browse: { text: '', highlighted: '' },
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

    const handleDeepNestedChange = (section: 'mainPage' | 'modals', parent: string, nestedParent: string, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [parent]: {
                    ...(prev[section] as any)[parent],
                    [nestedParent]: {
                        ...(prev[section] as any)[parent][nestedParent],
                        [field]: value,
                    },
                },
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
            const result = await apiClient.post('/api/engage/public-events-volunteering', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Public Events Volunteering page created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/engage/public-events-volunteering');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create public events volunteering page', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create public events volunteering page', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600">
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Public Events Volunteering</h5>
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

                            {/* Quote */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quote Text</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Enter quote"
                                        value={formData.mainPage.quote.text}
                                        onChange={(e) => handleNestedChange('mainPage', 'quote', 'text', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quote Highlighted</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Highlighted quote text"
                                        value={formData.mainPage.quote.highlighted}
                                        onChange={(e) => handleNestedChange('mainPage', 'quote', 'highlighted', e.target.value)}
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
                                <h6 className="font-semibold mb-2">Why We Engage</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modals.whyWeEngage.title}
                                    onChange={(e) => handleNestedChange('modals', 'whyWeEngage', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modals.whyWeEngage.subHeadline}
                                    onChange={(e) => handleNestedChange('modals', 'whyWeEngage', 'subHeadline', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Ways to Get Involved</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modals.waysGetInvolved.title}
                                    onChange={(e) => handleNestedChange('modals', 'waysGetInvolved', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Download text"
                                    value={formData.modals.waysGetInvolved.download.text}
                                    onChange={(e) => handleDeepNestedChange('modals', 'waysGetInvolved', 'download', 'text', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Who Can Join</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.whoCanJoin.title}
                                    onChange={(e) => handleNestedChange('modals', 'whoCanJoin', 'title', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Volunteer Sign Up</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.volunteerSignUp.title}
                                    onChange={(e) => handleNestedChange('modals', 'volunteerSignUp', 'title', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Past Highlights</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Modal title"
                                    value={formData.modals.pastHighlights.title}
                                    onChange={(e) => handleNestedChange('modals', 'pastHighlights', 'title', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Note:</strong> You can create the basic structure here and edit individual modals in detail after creation. Rich text editor and file uploads will be available
                                in the modal editors.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                            {loading ? 'Creating...' : 'Create Public Events Volunteering'}
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

export default CreatePublicEventsVolunteeringPage;
