'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface MediaContactRequestsData {
    title: string;
    contactType: string[];
    email: string[];
    phoneNumber: {
        src: string;
        text: string;
    };
    timings: string;
}

const EditMediaContactRequestsPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState<MediaContactRequestsData>({
        title: '',
        contactType: [],
        email: [],
        phoneNumber: { src: '', text: '' },
        timings: '',
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/media-press/${id}`);
            if (result.success && result.data.mediaContactRequests) {
                setFormData(result.data.mediaContactRequests);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'phoneNumberSrc') {
            setFormData(prev => ({ ...prev, phoneNumber: { ...prev.phoneNumber, src: value } }));
        } else if (field === 'phoneNumberText') {
            setFormData(prev => ({ ...prev, phoneNumber: { ...prev.phoneNumber, text: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addContactType = () => {
        setFormData(prev => ({ ...prev, contactType: [...prev.contactType, ''] }));
    };

    const updateContactType = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            contactType: prev.contactType.map((item, i) => i === index ? value : item)
        }));
    };

    const removeContactType = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contactType: prev.contactType.filter((_, i) => i !== index)
        }));
    };

    const addEmail = () => {
        setFormData(prev => ({ ...prev, email: [...prev.email, ''] }));
    };

    const updateEmail = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            email: prev.email.map((item, i) => i === index ? value : item)
        }));
    };

    const removeEmail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            email: prev.email.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
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
            const result = await apiClient.patch(`/api/engage/media-press/${id}`, {
                mediaContactRequests: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Media Contact Requests section updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/media-press');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update', 'error');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire('Error', error.message || 'Failed to update', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/engage/media-press')}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Media Contact Requests</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                        
                        <div className="space-y-4">
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
                                <label className="block text-sm font-medium mb-2">Timings</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Monday - Friday, 9 AM - 5 PM EST"
                                    value={formData.timings}
                                    onChange={(e) => handleInputChange('timings', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Types */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Contact Types</h6>
                            <button
                                type="button"
                                onClick={addContactType}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Contact Type
                            </button>
                        </div>

                        <div className="space-y-2">
                            {formData.contactType.map((type, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="e.g., General Inquiries, Press Releases"
                                        value={type}
                                        onChange={(e) => updateContactType(index, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeContactType(index)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email Addresses */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Email Addresses</h6>
                            <button
                                type="button"
                                onClick={addEmail}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Email
                            </button>
                        </div>

                        <div className="space-y-2">
                            {formData.email.map((email, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="email"
                                        className="form-input flex-1"
                                        placeholder="contact@example.com"
                                        value={email}
                                        onChange={(e) => updateEmail(index, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeEmail(index)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Phone Number</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Link (tel:)</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="tel:+1234567890"
                                    value={formData.phoneNumber.src}
                                    onChange={(e) => handleInputChange('phoneNumberSrc', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Display Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="+1 (234) 567-8900"
                                    value={formData.phoneNumber.text}
                                    onChange={(e) => handleInputChange('phoneNumberText', e.target.value)}
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
                            {loading ? 'Updating...' : 'Update Media Contact Requests'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/engage/media-press')}
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

export default EditMediaContactRequestsPage;
