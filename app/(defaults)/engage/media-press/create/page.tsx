'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface MediaPressFormData {
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
    latestPressReleases: {
        title: string;
        items: Array<{
            img: {
                src: string;
                alt: string;
            };
            title: string;
            date: string;
            datetime: string;
            cta: {
                text: string;
                href: string;
            };
        }>;
    };
    mediaContactRequests: {
        title: string;
        contactType: string[];
        email: string[];
        phoneNumber: {
            src: string;
            text: string;
        };
        timings: string;
    };
    mediaKitDownload: {
        title: string;
        kits: Array<{
            src: string;
            title: string;
        }>;
    };
    greenNews: {
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
    };
    officialSpokesPeople: {
        title: string;
        items: Array<{
            img: {
                src: string;
                alt: string;
            };
            title: string;
            member: {
                name: string;
                designation: string;
            };
        }>;
    };
}

const CreateMediaPressPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<MediaPressFormData>({
        mainPage: {
            title: '',
            subHeadline: '',
            description: { text: '', highlighted: '' },
            quote: { text: '', highlighted: '' },
            cta: [],
        },
        latestPressReleases: {
            title: '',
            items: [],
        },
        mediaContactRequests: {
            title: '',
            contactType: [],
            email: [],
            phoneNumber: { src: '', text: '' },
            timings: '',
        },
        mediaKitDownload: {
            title: '',
            kits: [],
        },
        greenNews: {
            title: '',
            description: '',
            cta: { text: '', href: '' },
            img: { src: '', alt: '' },
        },
        officialSpokesPeople: {
            title: '',
            items: [],
        },
    });

    const handleInputChange = (section: keyof MediaPressFormData, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
        if (errors[`${section}.${field}`]) {
            setErrors((prev) => ({ ...prev, [`${section}.${field}`]: '' }));
        }
    };

    const handleNestedChange = (section: keyof MediaPressFormData, parent: string, field: string, value: string) => {
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
            const result = await apiClient.post('/api/engage/media-press', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Media Press page created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/engage/media-press');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create media press page', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create media press page', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Media Press</h5>
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
                                <h6 className="font-semibold mb-2">Latest Press Releases</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Section title"
                                    value={formData.latestPressReleases.title}
                                    onChange={(e) => handleInputChange('latestPressReleases', 'title', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Media Contact Requests</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Section title"
                                    value={formData.mediaContactRequests.title}
                                    onChange={(e) => handleInputChange('mediaContactRequests', 'title', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Timings"
                                    value={formData.mediaContactRequests.timings}
                                    onChange={(e) => handleInputChange('mediaContactRequests', 'timings', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Media Kit Download</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Section title"
                                    value={formData.mediaKitDownload.title}
                                    onChange={(e) => handleInputChange('mediaKitDownload', 'title', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Green News</h6>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="Section title"
                                    value={formData.greenNews.title}
                                    onChange={(e) => handleInputChange('greenNews', 'title', e.target.value)}
                                />
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    placeholder="Description"
                                    value={formData.greenNews.description}
                                    onChange={(e) => handleInputChange('greenNews', 'description', e.target.value)}
                                />
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <h6 className="font-semibold mb-2">Official Spokes People</h6>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Section title"
                                    value={formData.officialSpokesPeople.title}
                                    onChange={(e) => handleInputChange('officialSpokesPeople', 'title', e.target.value)}
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
                            {loading ? 'Creating...' : 'Create Media Press'}
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

export default CreateMediaPressPage;