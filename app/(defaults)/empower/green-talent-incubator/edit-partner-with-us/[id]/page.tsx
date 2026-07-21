'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface GreenTalentPartnerKey {
    title: string;
    description: string;
}

interface PartnerWithUsFormData {
    title: string;
    description: string;
    keys: GreenTalentPartnerKey[];
}

const EditPartnerWithUsPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otherData, setOtherData] = useState<any>(null);

    const [formData, setFormData] = useState<PartnerWithUsFormData>({
        title: '',
        description: '',
        keys: [],
    });

    useEffect(() => {
        if (id) {
            fetchGreenTalentData();
        }
    }, [id]);

    const fetchGreenTalentData = async () => {
        try {
            const result = await apiClient.get(`/api/empower/green-talent-incubator/${id}`);
            if (result.success) {
                const data = result.data;
                setFormData({
                    title: data.modals.partnerWithUs.title || '',
                    description: data.modals.partnerWithUs.description || '',
                    keys: data.modals.partnerWithUs.keys || [],
                });
                setOtherData({
                    mainPage: data.mainPage,
                    modals: {
                        ...data.modals,
                        partnerWithUs: undefined,
                    },
                });
            } else {
                Swal.fire('Error', 'Failed to fetch green talent incubator data', 'error');
                router.push('/empower/green-talent-incubator');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error', 'Failed to fetch green talent incubator data', 'error');
            router.push('/empower/green-talent-incubator');
        } finally {
            setFetchingData(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const addKey = () => {
        setFormData((prev) => ({
            ...prev,
            keys: [...prev.keys, { title: '', description: '' }],
        }));
    };

    const updateKey = (index: number, field: 'title' | 'description', value: string) => {
        setFormData((prev) => ({
            ...prev,
            keys: prev.keys.map((k, i) => (i === index ? { ...k, [field]: value } : k)),
        }));
    };

    const removeKey = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            keys: prev.keys.filter((_, i) => i !== index),
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
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
                mainPage: otherData.mainPage,
                modals: {
                    ...otherData.modals,
                    partnerWithUs: formData,
                },
            };

            const result = await apiClient.put(`/api/empower/green-talent-incubator/${id}`, payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Partner With Us modal updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/green-talent-incubator');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update modal', 'error');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire('Error', error.message || 'Failed to update modal', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit "Partner With Us" Modal</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Modal Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter modal title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            placeholder="Enter modal description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Partnership Keys */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Partnership Benefits</h6>
                            <button
                                type="button"
                                onClick={addKey}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add Benefit
                            </button>
                        </div>

                        {formData.keys.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                No partnership benefits added yet. Click "Add Benefit" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.keys.map((item, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-medium">Benefit #{index + 1}</h6>
                                            <button
                                                type="button"
                                                onClick={() => removeKey(index)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Remove Benefit"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Benefit title"
                                                    value={item.title}
                                                    onChange={(e) => updateKey(index, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={2}
                                                    placeholder="Benefit description"
                                                    value={item.description}
                                                    onChange={(e) => updateKey(index, 'description', e.target.value)}
                                                />
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
                            {loading ? 'Saving...' : 'Save Modal'}
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

export default EditPartnerWithUsPage;
