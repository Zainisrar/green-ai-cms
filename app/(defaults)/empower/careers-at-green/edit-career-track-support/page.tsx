'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface CareerRole {
    type: string;
    description: string;
}

interface CareerTrackSupport {
    title: string;
    role: CareerRole[];
}

const EditCareerTrackSupportPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [careersId, setCareersId] = useState<number | null>(null);
    const [otherData, setOtherData] = useState<any>(null);
    
    const [formData, setFormData] = useState<CareerTrackSupport>({
        title: '',
        role: []
    });

    useEffect(() => {
        fetchCareerTrackSupportData();
    }, []);

    const fetchCareerTrackSupportData = async () => {
        try {
            const result = await apiClient.get('/api/empower/careers-at-green');
            if (result.success && result.data?.careerTrackSupport) {
                setFormData(result.data.careerTrackSupport);
                setCareersId(result.data.id);
                setOtherData({
                    mainPage: result.data.mainPage,
                    whyWorkWithGreenModal: result.data.whyWorkWithGreenModal,
                    whatMakesGreenDifferent: result.data.whatMakesGreenDifferent,
                    openRoles: result.data.openRoles
                });
            }
        } catch (error: any) {
            console.error('Fetch career track support data error:', error);
            Swal.fire('Error', 'Failed to fetch data', 'error');
        } finally {
            setFetchingData(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addRole = () => {
        setFormData(prev => ({
            ...prev,
            role: [...prev.role, { type: '', description: '' }]
        }));
    };

    const updateRole = (index: number, field: 'type' | 'description', value: string) => {
        setFormData(prev => ({
            ...prev,
            role: prev.role.map((role, i) => i === index ? { ...role, [field]: value } : role)
        }));
    };

    const removeRole = (index: number) => {
        setFormData(prev => ({
            ...prev,
            role: prev.role.filter((_, i) => i !== index)
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
                id: careersId,
                mainPage: otherData?.mainPage,
                whyWorkWithGreenModal: otherData?.whyWorkWithGreenModal,
                careerTrackSupport: formData,
                whatMakesGreenDifferent: otherData?.whatMakesGreenDifferent,
                openRoles: otherData?.openRoles
            };

            const result = careersId 
                ? await apiClient.put('/api/empower/careers-at-green', payload)
                : await apiClient.post('/api/empower/careers-at-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Career Track Support section updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/empower/careers-at-green');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update section', 'error');
            }
        } catch (error: any) {
            console.error('Update career track support error:', error);
            Swal.fire('Error', error.message || 'Failed to update section', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Career Track Support</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
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

                    {/* Roles */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Career Roles</label>
                            <button
                                type="button"
                                onClick={addRole}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add Role
                            </button>
                        </div>
                        
                        {formData.role.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No roles added yet. Click "Add Role" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.role.map((role, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold">Role {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeRole(index)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Remove Role"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Role Type</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="e.g., Engineering, Sales, Marketing"
                                                    value={role.type}
                                                    onChange={(e) => updateRole(index, 'type', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={3}
                                                    placeholder="Enter role description"
                                                    value={role.description}
                                                    onChange={(e) => updateRole(index, 'description', e.target.value)}
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
                            {loading ? 'Saving...' : 'Save Career Track Support'}
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

export default EditCareerTrackSupportPage;