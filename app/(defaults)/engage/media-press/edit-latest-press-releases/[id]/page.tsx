'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconX from '@/components/icon/icon-x';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useImageUpload } from '@/hooks/useImageUpload';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface LatestPressReleasesData {
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
}

const EditLatestPressReleasesPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    
    const [formData, setFormData] = useState<LatestPressReleasesData>({
        title: '',
        items: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/media-press/${id}`);
            if (result.success && result.data.latestPressReleases) {
                setFormData(result.data.latestPressReleases);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof LatestPressReleasesData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addPressRelease = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                img: { src: '', alt: '' },
                title: '',
                date: '',
                datetime: '',
                cta: { text: '', href: '' }
            }]
        }));
    };

    const updatePressRelease = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    if (field === 'imgSrc') {
                        return { ...item, img: { ...item.img, src: value } };
                    } else if (field === 'imgAlt') {
                        return { ...item, img: { ...item.img, alt: value } };
                    } else if (field === 'ctaText') {
                        return { ...item, cta: { ...item.cta, text: value } };
                    } else if (field === 'ctaHref') {
                        return { ...item, cta: { ...item.cta, href: value } };
                    } else {
                        return { ...item, [field]: value };
                    }
                }
                return item;
            })
        }));
    };

    const removePressRelease = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const openMediaPicker = (index: number) => {
        setCurrentImageIndex(index);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (media: any) => {
        if (currentImageIndex !== null) {
            updatePressRelease(currentImageIndex, 'imgSrc', media.url);
        }
        setShowMediaPicker(false);
        setCurrentImageIndex(null);
    };

    const removeImage = (index: number) => {
        updatePressRelease(index, 'imgSrc', '');
        updatePressRelease(index, 'imgAlt', '');
    };

    const handleImageUpload = async (index: number, file: File) => {
        setUploadingIndex(index);
        try {
            const result = await uploadImage(file, 'media-press/press-releases');
            if (result?.url) {
                updatePressRelease(index, 'imgSrc', result.url);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveImage = (index: number) => {
        updatePressRelease(index, 'imgSrc', '');
        updatePressRelease(index, 'imgAlt', '');
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
                latestPressReleases: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Latest Press Releases section updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Latest Press Releases</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                        
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
                    </div>

                    {/* Press Releases */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Press Releases</h6>
                            <button
                                type="button"
                                onClick={addPressRelease}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Press Release
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Press Release {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removePressRelease(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter press release title"
                                                value={item.title}
                                                onChange={(e) => updatePressRelease(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Date</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., March 15, 2024"
                                                value={item.date}
                                                onChange={(e) => updatePressRelease(index, 'date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">DateTime (ISO)</label>
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={item.datetime}
                                                onChange={(e) => updatePressRelease(index, 'datetime', e.target.value)}
                                            />
                                        </div>
                                        
                                        {/* Image Upload */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Press Release Image</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openMediaPicker(index)}
                                                        className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm w-full"
                                                    >
                                                        Browse Media Library
                                                    </button>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleImageUpload(index, file);
                                                        }}
                                                        className="form-input"
                                                        disabled={uploadingIndex === index}
                                                    />
                                                    {uploadingIndex === index && (
                                                        <p className="text-sm text-blue-500 mt-1">Uploading image...</p>
                                                    )}
                                                    {uploadError && uploadingIndex === index && (
                                                        <p className="text-sm text-red-500 mt-1">{uploadError}</p>
                                                    )}
                                                    
                                                    {item.img.src && (
                                                        <div className="mt-2 relative inline-block">
                                                            <img
                                                                src={item.img.src}
                                                                alt={item.img.alt}
                                                                className="h-32 w-auto object-contain bg-gray-100 dark:bg-gray-800 rounded"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                                <IconX className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Alt text for accessibility"
                                                        value={item.img.alt}
                                                        onChange={(e) => updatePressRelease(index, 'imgAlt', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium mb-2">CTA Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Read More"
                                                value={item.cta.text}
                                                onChange={(e) => updatePressRelease(index, 'ctaText', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">CTA Link</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://example.com/press-release"
                                                value={item.cta.href}
                                                onChange={(e) => updatePressRelease(index, 'ctaHref', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No press releases added yet. Click "Add Press Release" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Updating...' : 'Update Latest Press Releases'}
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

            <MediaPicker
                isOpen={showMediaPicker}
                onSelect={handleMediaSelect}
                onClose={() => {
                    setShowMediaPicker(false);
                    setCurrentImageIndex(null);
                }}
                allowedTypes={['image']}
            />
        </ProtectedRoute>
    );
};

export default EditLatestPressReleasesPage;