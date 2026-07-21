'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface JoinUsFormData {
    title: string;
    subHeadline: string;
    description: string;
    existingUsersCtaLink: string;
    newUsersCtaLink: string;
    quote: {
        text: string;
        link: string;
    };
    cta: Array<{
        text: string;
        href: string;
    }>;
    keys: Array<{
        title: string;
        items: Array<{
            text: string;
            description?: string;
        }>;
    }>;
    dataPolicyEthics: {
        title: string;
        description: string;
    };
    email: {
        text: string;
        href: string;
    };
    phone: {
        text: string;
        href: string;
    };
}

const CreateJoinUsPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<JoinUsFormData>({
        title: '',
        subHeadline: '',
        description: '',
        existingUsersCtaLink: '',
        newUsersCtaLink: '',
        quote: { text: '', link: '' },
        cta: [],
        keys: [],
        dataPolicyEthics: { title: '', description: '' },
        email: { text: '', href: '' },
        phone: { text: '', href: '' },
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: keyof JoinUsFormData, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent] as any, [field]: value },
        }));
    };

    const addCTA = () => {
        setFormData((prev) => ({
            ...prev,
            cta: [...prev.cta, { text: '', href: '' }],
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
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.subHeadline.trim()) {
            newErrors.subHeadline = 'Sub-headline is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.existingUsersCtaLink.trim()) {
            newErrors.existingUsersCtaLink = 'Existing users CTA link is required';
        }

        if (!formData.newUsersCtaLink.trim()) {
            newErrors.newUsersCtaLink = 'New users CTA link is required';
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
            const result = await apiClient.post('/api/empower/join-us', formData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Join Us page created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/join-us');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create join us page', 'error');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            Swal.fire('Error', error.message || 'Failed to create join us page', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Create Join Us Page</h5>
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

                    <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            placeholder="Enter description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* CTA Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Existing Users CTA Link *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="https://example.com"
                                value={formData.existingUsersCtaLink}
                                onChange={(e) => handleInputChange('existingUsersCtaLink', e.target.value)}
                            />
                            {errors.existingUsersCtaLink && <p className="text-red-500 text-sm mt-1">{errors.existingUsersCtaLink}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">New Users CTA Link *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="https://example.com"
                                value={formData.newUsersCtaLink}
                                onChange={(e) => handleInputChange('newUsersCtaLink', e.target.value)}
                            />
                            {errors.newUsersCtaLink && <p className="text-red-500 text-sm mt-1">{errors.newUsersCtaLink}</p>}
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Quote Text</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Enter quote text"
                                value={formData.quote.text}
                                onChange={(e) => handleNestedChange('quote', 'text', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Quote Link</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="https://example.com"
                                value={formData.quote.link}
                                onChange={(e) => handleNestedChange('quote', 'link', e.target.value)}
                            />
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
                                            <label className="block text-sm font-medium mb-2">Button URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="form-input flex-1"
                                                    placeholder="https://example.com"
                                                    value={cta.href}
                                                    onChange={(e) => updateCTA(index, 'href', e.target.value)}
                                                />
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

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h6 className="text-lg font-semibold">Email Contact</h6>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Email"
                                    value={formData.email.text}
                                    onChange={(e) => handleNestedChange('email', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Link</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="mailto:example@email.com"
                                    value={formData.email.href}
                                    onChange={(e) => handleNestedChange('email', 'href', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h6 className="text-lg font-semibold">Phone Contact</h6>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Phone"
                                    value={formData.phone.text}
                                    onChange={(e) => handleNestedChange('phone', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Link</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="tel:+1234567890"
                                    value={formData.phone.href}
                                    onChange={(e) => handleNestedChange('phone', 'href', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Policy & Ethics */}
                    <div>
                        <h6 className="text-lg font-semibold mb-4">Data Policy & Ethics</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Policy title"
                                    value={formData.dataPolicyEthics.title}
                                    onChange={(e) => handleNestedChange('dataPolicyEthics', 'title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Policy description"
                                    value={formData.dataPolicyEthics.description}
                                    onChange={(e) => handleNestedChange('dataPolicyEthics', 'description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Creating...' : 'Create Join Us Page'}
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

export default CreateJoinUsPage;