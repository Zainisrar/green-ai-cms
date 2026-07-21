'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface AlumniVoicesFormData {
    title: string;
    voices: {
        text1: string;
        text2: string;
    };
}

const EditAlumniVoicesPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otherData, setOtherData] = useState<any>(null);

    const [formData, setFormData] = useState<AlumniVoicesFormData>({
        title: '',
        voices: {
            text1: '',
            text2: '',
        },
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
                    title: data.modals.alumniVoices.title || '',
                    voices: data.modals.alumniVoices.voices || { text1: '', text2: '' },
                });
                setOtherData({
                    mainPage: data.mainPage,
                    modals: {
                        ...data.modals,
                        alumniVoices: undefined,
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

    const handleVoicesChange = (field: 'text1' | 'text2', value: string) => {
        setFormData((prev) => ({
            ...prev,
            voices: { ...prev.voices, [field]: value },
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
            const payload = {
                mainPage: otherData.mainPage,
                modals: {
                    ...otherData.modals,
                    alumniVoices: formData,
                },
            };

            const result = await apiClient.put(`/api/empower/green-talent-incubator/${id}`, payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Alumni Voices modal updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit "Alumni Voices" Modal</h5>
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

                    {/* Alumni Voices */}
                    <div>
                        <h6 className="text-lg font-semibold mb-4">Alumni Testimonials</h6>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Voice 1 - First Section</label>
                                <textarea
                                    className="form-textarea"
                                    rows={5}
                                    placeholder="Enter first testimonial section"
                                    value={formData.voices.text1}
                                    onChange={(e) => handleVoicesChange('text1', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">This is the first part of the alumni testimonial</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Voice 2 - Second Section</label>
                                <textarea
                                    className="form-textarea"
                                    rows={5}
                                    placeholder="Enter second testimonial section"
                                    value={formData.voices.text2}
                                    onChange={(e) => handleVoicesChange('text2', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">This is the second part of the alumni testimonial</p>
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

export default EditAlumniVoicesPage;
