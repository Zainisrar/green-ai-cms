'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface OpenRole {
    name: string;
    place: string;
    closing: string;
}

const AddOpenRolePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState<OpenRole>({
        name: '',
        place: '',
        closing: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Role name is required';
        }

        if (!formData.place.trim()) {
            newErrors.place = 'Location is required';
        }

        if (!formData.closing.trim()) {
            newErrors.closing = 'Closing date is required';
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
            // First fetch existing careers data
            const existingResult = await apiClient.get('/api/empower/careers-at-green');
            const existingData = existingResult.data;

            // Add role to existing roles
            const updatedRoles = [...(existingData?.openRoles?.roles || []), formData];

            const updatedOpenRoles = {
                title: existingData?.openRoles?.title || '',
                roles: updatedRoles
            };

            const payload = {
                id: existingData?.id,
                mainPage: existingData?.mainPage || {
                    title: '',
                    subHeadline: '',
                    description: { text: '', highlighted: '' },
                    quote1: { text: '', highlighted: '' },
                    quote2: { text: '', highlighted: '' },
                    keys: [],
                    cta: []
                },
                whyWorkWithGreenModal: existingData?.whyWorkWithGreenModal || {
                    title: '',
                    description: '',
                    icons: [],
                    quote: { text1: '', text2: '', highlighted1: '', highlighted2: '' }
                },
                careerTrackSupport: existingData?.careerTrackSupport || {
                    title: '',
                    role: []
                },
                whatMakesGreenDifferent: existingData?.whatMakesGreenDifferent || {
                    title: '',
                    featuredImg: { src: '', alt: '' },
                    keyPoints: []
                },
                openRoles: updatedOpenRoles
            };

            const result = existingData?.id 
                ? await apiClient.put('/api/empower/careers-at-green', payload)
                : await apiClient.post('/api/empower/careers-at-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Open role added successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/empower/careers-at-green');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to add open role', 'error');
            }
        } catch (error: any) {
            console.error('Add open role error:', error);
            Swal.fire('Error', error.message || 'Failed to add open role', 'error');
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Add Open Role</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Role Name *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Senior Software Engineer"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Location *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., New York, NY / Remote"
                            value={formData.place}
                            onChange={(e) => handleInputChange('place', e.target.value)}
                        />
                        {errors.place && <p className="text-red-500 text-sm mt-1">{errors.place}</p>}
                    </div>

                    {/* Closing Date */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Closing Date *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., December 31, 2024"
                            value={formData.closing}
                            onChange={(e) => handleInputChange('closing', e.target.value)}
                        />
                        {errors.closing && <p className="text-red-500 text-sm mt-1">{errors.closing}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the application closing date in a readable format
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Adding...' : 'Add Open Role'}
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

export default AddOpenRolePage;