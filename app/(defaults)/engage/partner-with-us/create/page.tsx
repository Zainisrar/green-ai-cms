'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploadField from '@/components/shared/ImageUploadField';

interface PartnerWithUsFormData {
    mainPage: {
        title: string;
        subHeadline: string;
        description: {
            text: string;
            highlighted: string;
        };
        key: Array<{
            title: string;
            description: string;
            cta: string;
        }>;
        quote: {
            text: string;
            highlighted: string;
        };
        img: {
            src: string;
            alt: string;
        };
        cta: Array<{
            text: string;
            href: string;
        }>;
    };
    modal: {
        whyGreen: {
            title: string;
            subHeadline: string;
            key: Array<{
                title: string;
                description: string;
            }>;
            quote: {
                text: string;
                highlighted: string;
            };
        };
        partnerShipTypes: {
            title: string;
            subHeadline: string;
            keys: Array<{
                icon: {
                    src: string;
                    alt: string;
                };
                title: string;
                description: string;
            }>;
        };
        whatYouCanExpect: {
            title: string;
            subHeadline: string;
            keys: string[];
        };
        abortionChannels: {
            title: string;
            subHeadline: string;
            key1: {
                title: string;
                items: string[];
            };
            key2: {
                title: string;
                items: string[];
            };
        };
        trustedBy: {
            title: string;
            subHeadline: string;
            icons: Array<{
                src: string;
                alt: string;
            }>;
        };
    };
}

const CreatePartnerWithUsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<PartnerWithUsFormData>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            key: [],
            quote: { text: '', highlighted: '' },
            img: { src: '', alt: '' },
            cta: [],
        },
        modal: {
            whyGreen: {
                title: '',
                subHeadline: '',
                key: [],
                quote: { text: '', highlighted: '' },
            },
            partnerShipTypes: {
                title: '',
                subHeadline: '',
                keys: [],
            },
            whatYouCanExpect: {
                title: '',
                subHeadline: '',
                keys: [],
            },
            abortionChannels: {
                title: '',
                subHeadline: '',
                key1: { title: '', items: [] },
                key2: { title: '', items: [] },
            },
            trustedBy: {
                title: '',
                subHeadline: '',
                icons: [],
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
            const result = await apiClient.post('/api/engage/partner-with-us', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Partner With Us page created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/engage/partner-with-us');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create partner with us page', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create partner with us page', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Partner With Us</h5>
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

                            {/* Image */}
                            <ImageUploadField
                                value={formData.mainPage.img}
                                onChange={(img) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        mainPage: {
                                            ...prev.mainPage,
                                            img,
                                        },
                                    }))
                                }
                                folder="engage/partner-with-us"
                                label="Main Page Image"
                            />
                        </div>
                    </div>

                    {/* Modal Placeholders */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Modal Content</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Why Green</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.whyGreen.title}
                                    onChange={(e) => handleNestedChange('modal', 'whyGreen', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modal.whyGreen.subHeadline}
                                    onChange={(e) => handleNestedChange('modal', 'whyGreen', 'subHeadline', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Partnership Types</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.partnerShipTypes.title}
                                    onChange={(e) => handleNestedChange('modal', 'partnerShipTypes', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modal.partnerShipTypes.subHeadline}
                                    onChange={(e) => handleNestedChange('modal', 'partnerShipTypes', 'subHeadline', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">What You Can Expect</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.whatYouCanExpect.title}
                                    onChange={(e) => handleNestedChange('modal', 'whatYouCanExpect', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modal.whatYouCanExpect.subHeadline}
                                    onChange={(e) => handleNestedChange('modal', 'whatYouCanExpect', 'subHeadline', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Abortion Channels</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.abortionChannels.title}
                                    onChange={(e) => handleNestedChange('modal', 'abortionChannels', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modal.abortionChannels.subHeadline}
                                    onChange={(e) => handleNestedChange('modal', 'abortionChannels', 'subHeadline', e.target.value)}
                                />
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Trusted By</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Modal title"
                                    value={formData.modal.trustedBy.title}
                                    onChange={(e) => handleNestedChange('modal', 'trustedBy', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Sub-headline"
                                    value={formData.modal.trustedBy.subHeadline}
                                    onChange={(e) => handleNestedChange('modal', 'trustedBy', 'subHeadline', e.target.value)}
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
                        <button type="submit" disabled={loading} className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600">
                            {loading ? 'Creating...' : 'Create Partner With Us'}
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

export default CreatePartnerWithUsPage;
