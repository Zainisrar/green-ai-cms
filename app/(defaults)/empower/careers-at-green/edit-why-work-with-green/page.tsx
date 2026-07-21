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

interface WhyWorkWithGreenIcon {
    img: CareersImage;
    title: string;
    description: string;
}

interface WhyWorkWithGreenQuote {
    text1: string;
    text2: string;
    highlighted1: string;
    highlighted2?: string;
}

interface WhyWorkWithGreenModal {
    title: string;
    description: string;
    icons: WhyWorkWithGreenIcon[];
    quote: WhyWorkWithGreenQuote;
}

const EditWhyWorkWithGreenPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [careersId, setCareersId] = useState<number | null>(null);
    const [otherData, setOtherData] = useState<any>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentIconIndex, setCurrentIconIndex] = useState<number | null>(null);
    
    const [formData, setFormData] = useState<WhyWorkWithGreenModal>({
        title: '',
        description: '',
        icons: [],
        quote: { text1: '', text2: '', highlighted1: '', highlighted2: '' }
    });

    useEffect(() => {
        fetchWhyWorkWithGreenData();
    }, []);

    const fetchWhyWorkWithGreenData = async () => {
        try {
            const result = await apiClient.get('/api/empower/careers-at-green');
            if (result.success && result.data?.whyWorkWithGreenModal) {
                setFormData(result.data.whyWorkWithGreenModal);
                setCareersId(result.data.id);
                setOtherData({
                    mainPage: result.data.mainPage,
                    careerTrackSupport: result.data.careerTrackSupport,
                    whatMakesGreenDifferent: result.data.whatMakesGreenDifferent,
                    openRoles: result.data.openRoles
                });
            }
        } catch (error: any) {
            console.error('Fetch why work with green data error:', error);
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

    const handleQuoteChange = (field: 'text1' | 'text2' | 'highlighted1' | 'highlighted2', value: string) => {
        setFormData(prev => ({
            ...prev,
            quote: { ...prev.quote, [field]: value }
        }));
    };

    const addIcon = () => {
        setFormData(prev => ({
            ...prev,
            icons: [...prev.icons, { img: { src: '', alt: '' }, title: '', description: '' }]
        }));
    };

    const updateIcon = (index: number, field: 'title' | 'description', value: string) => {
        setFormData(prev => ({
            ...prev,
            icons: prev.icons.map((icon, i) => i === index ? { ...icon, [field]: value } : icon)
        }));
    };

    const updateIconImage = (index: number, field: 'src' | 'alt', value: string) => {
        setFormData(prev => ({
            ...prev,
            icons: prev.icons.map((icon, i) => i === index ? { ...icon, img: { ...icon.img, [field]: value } } : icon)
        }));
    };

    const removeIcon = (index: number) => {
        setFormData(prev => ({
            ...prev,
            icons: prev.icons.filter((_, i) => i !== index)
        }));
    };

    const openMediaPicker = (iconIndex: number) => {
        setCurrentIconIndex(iconIndex);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (media: any) => {
        if (currentIconIndex !== null) {
            updateIconImage(currentIconIndex, 'src', media.url);
        }
        setShowMediaPicker(false);
        setCurrentIconIndex(null);
    };

    const handleIconImageUpload = async (iconIndex: number, imageList: any) => {
        // Removed - no longer using ImageUploading component
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
                id: careersId,
                mainPage: otherData?.mainPage,
                whyWorkWithGreenModal: formData,
                careerTrackSupport: otherData?.careerTrackSupport,
                whatMakesGreenDifferent: otherData?.whatMakesGreenDifferent,
                openRoles: otherData?.openRoles
            };

            const result = careersId 
                ? await apiClient.put('/api/empower/careers-at-green', payload)
                : await apiClient.post('/api/empower/careers-at-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Why Work With Green section updated successfully',
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
            console.error('Update why work with green error:', error);
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Why Work With Green</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
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
                    </div>

                    {/* Icons */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Icons</label>
                            <button
                                type="button"
                                onClick={addIcon}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add Icon
                            </button>
                        </div>
                        
                        {formData.icons.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No icons added yet. Click "Add Icon" to create one.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.icons.map((icon, iconIndex) => (
                                    <div key={iconIndex} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold">Icon {iconIndex + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeIcon(iconIndex)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Remove Icon"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Enter icon title"
                                                    value={icon.title}
                                                    onChange={(e) => updateIcon(iconIndex, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={2}
                                                    placeholder="Enter icon description"
                                                    value={icon.description}
                                                    onChange={(e) => updateIcon(iconIndex, 'description', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Icon Image</label>
                                            {icon.img.src && (
                                                <div className="mb-3">
                                                    <img
                                                        src={icon.img.src}
                                                        alt={icon.img.alt || 'Icon'}
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openMediaPicker(iconIndex)}
                                                className="btn btn-sm bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                                            >
                                                Browse Media Library
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Image description"
                                                value={icon.img.alt}
                                                onChange={(e) => updateIconImage(iconIndex, 'alt', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quote */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Quote</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text 1</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="First part of quote"
                                    value={formData.quote.text1}
                                    onChange={(e) => handleQuoteChange('text1', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text 2</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Second part of quote"
                                    value={formData.quote.text2}
                                    onChange={(e) => handleQuoteChange('text2', e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text 1</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="First highlighted part"
                                    value={formData.quote.highlighted1}
                                    onChange={(e) => handleQuoteChange('highlighted1', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text 2 (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Second highlighted part (optional)"
                                    value={formData.quote.highlighted2 || ''}
                                    onChange={(e) => handleQuoteChange('highlighted2', e.target.value)}
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
                            {loading ? 'Saving...' : 'Save Why Work With Green'}
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
                    onClose={() => {
                        setShowMediaPicker(false);
                        setCurrentIconIndex(null);
                    }}
                    allowedTypes={['image']}
                />
            )}
        </ProtectedRoute>
    );
};

export default EditWhyWorkWithGreenPage;