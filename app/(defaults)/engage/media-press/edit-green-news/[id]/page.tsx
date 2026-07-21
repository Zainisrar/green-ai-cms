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

interface GreenNewsData {
    title: string;
    items: Array<{
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
    }>;
}

const EditGreenNewsPage = () => {
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
    
    const [formData, setFormData] = useState<GreenNewsData>({
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
            if (result.success && result.data.greenNews) {
                // Handle both old and new data structures
                const greenNewsData = result.data.greenNews;
                if (Array.isArray(greenNewsData.items)) {
                    // New structure with items array
                    setFormData(greenNewsData);
                } else {
                    // Old structure - convert to new format
                    setFormData({
                        title: greenNewsData.title || '',
                        items: []
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof GreenNewsData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addNewsItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                title: '',
                description: '',
                cta: { text: '', href: '' },
                img: { src: '', alt: '' }
            }]
        }));
    };

    const updateNewsItem = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    if (field === 'ctaText') {
                        return { ...item, cta: { ...item.cta, text: value } };
                    } else if (field === 'ctaHref') {
                        return { ...item, cta: { ...item.cta, href: value } };
                    } else if (field === 'imgAlt') {
                        return { ...item, img: { ...item.img, alt: value } };
                    } else {
                        return { ...item, [field]: value };
                    }
                }
                return item;
            })
        }));
    };

    const removeNewsItem = (index: number) => {
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
            setFormData(prev => ({
                ...prev,
                items: prev.items.map((item, i) => 
                    i === currentImageIndex ? { ...item, img: { ...item.img, src: media.url } } : item
                )
            }));
        }
        setShowMediaPicker(false);
        setCurrentImageIndex(null);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, img: { src: '', alt: '' } } : item
            )
        }));
    };

    const handleImageUpload = async (index: number, file: File) => {
        setUploadingIndex(index);
        try {
            const result = await uploadImage(file, 'media-press/green-news');
            if (result?.url) {
                setFormData(prev => ({
                    ...prev,
                    items: prev.items.map((item, i) => 
                        i === index ? { ...item, img: { ...item.img, src: result.url } } : item
                    )
                }));
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, img: { src: '', alt: '' } } : item
            )
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
                greenNews: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Green News section updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Green News</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Section Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter section title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>
                    </div>

                    {/* News Items */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Green News Items</h6>
                            <button
                                type="button"
                                onClick={addNewsItem}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add News Item
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.items && formData.items.length > 0 ? (
                                formData.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h6 className="font-medium">News Item {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeNewsItem(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">News Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter news title"
                                                value={item.title}
                                                onChange={(e) => updateNewsItem(index, 'title', e.target.value)}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={4}
                                                placeholder="Enter news description"
                                                value={item.description}
                                                onChange={(e) => updateNewsItem(index, 'description', e.target.value)}
                                            />
                                        </div>

                                        {/* Featured Image */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Featured Image</label>
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
                                                        <div className="mt-4 relative inline-block">
                                                            <img
                                                                src={item.img.src}
                                                                alt={item.img.alt}
                                                                className="h-48 w-auto object-contain bg-gray-100 dark:bg-gray-800 rounded"
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
                                                        onChange={(e) => updateNewsItem(index, 'imgAlt', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Call to Action</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm mb-1">CTA Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Read More"
                                                        value={item.cta.text}
                                                        onChange={(e) => updateNewsItem(index, 'ctaText', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm mb-1">CTA Link</label>
                                                    <input
                                                        type="url"
                                                        className="form-input"
                                                        placeholder="https://example.com/news"
                                                        value={item.cta.href}
                                                        onChange={(e) => updateNewsItem(index, 'ctaHref', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No news items added yet. Click "Add News Item" to get started.</p>
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
                            {loading ? 'Updating...' : 'Update Green News'}
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

export default EditGreenNewsPage;
