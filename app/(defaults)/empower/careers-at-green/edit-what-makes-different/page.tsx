'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface CareersImage {
    src: string;
    alt: string;
}

interface KeyPoint {
    text1: string;
    text2: string;
}

interface WhatMakesGreenDifferent {
    title: string;
    featuredImg: CareersImage;
    keyPoints: KeyPoint[];
}

const EditWhatMakesDifferentPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [careersId, setCareersId] = useState<number | null>(null);
    const [otherData, setOtherData] = useState<any>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    
    const [formData, setFormData] = useState<WhatMakesGreenDifferent>({
        title: '',
        featuredImg: { src: '', alt: '' },
        keyPoints: []
    });

    useEffect(() => {
        fetchWhatMakesDifferentData();
    }, []);

    const fetchWhatMakesDifferentData = async () => {
        try {
            const result = await apiClient.get('/api/empower/careers-at-green');
            if (result.success && result.data?.whatMakesGreenDifferent) {
                setFormData(result.data.whatMakesGreenDifferent);
                setCareersId(result.data.id);
                setOtherData({
                    mainPage: result.data.mainPage,
                    whyWorkWithGreenModal: result.data.whyWorkWithGreenModal,
                    careerTrackSupport: result.data.careerTrackSupport,
                    openRoles: result.data.openRoles
                });
            }
        } catch (error: any) {
            console.error('Fetch what makes different data error:', error);
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

    const handleImageChange = (field: 'src' | 'alt', value: string) => {
        setFormData(prev => ({
            ...prev,
            featuredImg: { ...prev.featuredImg, [field]: value }
        }));
    };

    const addKeyPoint = () => {
        setFormData(prev => ({
            ...prev,
            keyPoints: [...prev.keyPoints, { text1: '', text2: '' }]
        }));
    };

    const updateKeyPoint = (index: number, field: 'text1' | 'text2', value: string) => {
        setFormData(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.map((point, i) => i === index ? { ...point, [field]: value } : point)
        }));
    };

    const removeKeyPoint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.filter((_, i) => i !== index)
        }));
    };

    const handleMediaSelect = (media: any) => {
        setFormData(prev => ({
            ...prev,
            featuredImg: {
                ...prev.featuredImg,
                src: media.url
            }
        }));
        setShowMediaPicker(false);
    };

    const handleImageUpload = async (imageList: any) => {
        // Removed - no longer using ImageUploading component
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
                careerTrackSupport: otherData?.careerTrackSupport,
                whatMakesGreenDifferent: formData,
                openRoles: otherData?.openRoles
            };

            const result = careersId 
                ? await apiClient.put('/api/empower/careers-at-green', payload)
                : await apiClient.post('/api/empower/careers-at-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'What Makes Green Different section updated successfully',
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
            console.error('Update what makes different error:', error);
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit What Makes Green Different</h5>
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

                    {/* Featured Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Featured Image</label>
                        {formData.featuredImg.src && (
                            <div className="mb-3">
                                <img
                                    src={formData.featuredImg.src}
                                    alt={formData.featuredImg.alt || 'Featured'}
                                    className="w-full h-48 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="btn btn-sm bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        >
                            Browse Media Library
                        </button>
                    </div>

                    {/* Image Alt Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Image description"
                            value={formData.featuredImg.alt}
                            onChange={(e) => handleImageChange('alt', e.target.value)}
                        />
                    </div>

                    {/* Key Points */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Key Points</label>
                            <button
                                type="button"
                                onClick={addKeyPoint}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add Key Point
                            </button>
                        </div>
                        
                        {formData.keyPoints.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No key points added yet. Click "Add Key Point" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.keyPoints.map((point, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold">Key Point {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeKeyPoint(index)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Remove Key Point"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Text 1</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="First part of key point"
                                                    value={point.text1}
                                                    onChange={(e) => updateKeyPoint(index, 'text1', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Text 2</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Second part of key point"
                                                    value={point.text2}
                                                    onChange={(e) => updateKeyPoint(index, 'text2', e.target.value)}
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
                            {loading ? 'Saving...' : 'Save What Makes Green Different'}
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

            {/* MediaPicker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaPicker(false)}
                    allowedTypes={['image']}
                />
            )}
        </ProtectedRoute>
    );
};

export default EditWhatMakesDifferentPage;