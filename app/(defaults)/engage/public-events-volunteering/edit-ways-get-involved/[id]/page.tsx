'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface WaysGetInvolvedItem {
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
}

interface WaysGetInvolvedData {
    title: string;
    download: {
        text: string;
        href: string;
    };
    items: WaysGetInvolvedItem[];
}

const EditWaysGetInvolvedPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    const [mediaPickerType, setMediaPickerType] = useState<'image' | 'file'>('image');
    
    const [formData, setFormData] = useState<WaysGetInvolvedData>({
        title: '',
        download: { text: '', href: '' },
        items: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/public-events-volunteering/${id}`);
            if (result.success && result.data.modals.waysGetInvolved) {
                setFormData(result.data.modals.waysGetInvolved);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof WaysGetInvolvedData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [field]: value }
        }));
    };

    const handleItemChange = (index: number, field: string, value: string, nested?: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    if (nested) {
                        return {
                            ...item,
                            [nested]: { ...(item as any)[nested], [field]: value }
                        };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        }));
    };

    const addItem = () => {
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

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const openMediaPickerForImage = (index: number) => {
        setCurrentImageIndex(index);
        setMediaPickerType('image');
        setShowMediaPicker(true);
    };

    const openMediaPickerForFile = () => {
        setCurrentImageIndex(null);
        setMediaPickerType('file');
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (media: any) => {
        if (mediaPickerType === 'file') {
            setFormData(prev => ({ ...prev, download: { ...prev.download, href: media.url } }));
        } else if (currentImageIndex !== null) {
            handleItemChange(currentImageIndex, 'src', media.url, 'img');
        }
        setShowMediaPicker(false);
        setCurrentImageIndex(null);
    };

    const removeImage = (index: number) => {
        handleItemChange(index, 'src', '', 'img');
        handleItemChange(index, 'alt', '', 'img');
    };

    const removeDownloadFile = () => {
        setFormData(prev => ({ ...prev, download: { ...prev.download, href: '' } }));
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
            const result = await apiClient.patch(`/api/engage/public-events-volunteering/${id}`, {
                modals: { waysGetInvolved: formData }
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Ways Get Involved section updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/public-events-volunteering');
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
                            onClick={() => router.push('/engage/public-events-volunteering')}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Ways Get Involved</h5>
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

                    {/* Download Section */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Download Section</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Download Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter download text"
                                    value={formData.download.text}
                                    onChange={(e) => handleNestedChange('download', 'text', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium mb-2">Download File</label>
                                <button
                                    type="button"
                                    onClick={openMediaPickerForFile}
                                    className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm"
                                >
                                    Browse Media Library for File
                                </button>
                                {formData.download.href && (
                                    <div className="mt-2 p-2 bg-gray-100 rounded">
                                        <p className="text-sm truncate">{formData.download.href}</p>
                                        <button
                                            type="button"
                                            onClick={removeDownloadFile}
                                            className="btn btn-outline-danger btn-xs mt-1"
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                )}
                                <label className="block text-sm font-medium mb-2 mt-2">Or Enter Download URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://example.com/file.pdf"
                                    value={formData.download.href}
                                    onChange={(e) => handleNestedChange('download', 'href', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Ways to Get Involved Items</h6>
                            <button
                                type="button"
                                onClick={addItem}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add Item
                            </button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-medium">Item {index + 1}</h6>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter item title"
                                            value={item.title}
                                            onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="Enter item description"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">CTA Text</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter CTA text"
                                            value={item.cta.text}
                                            onChange={(e) => handleItemChange(index, 'text', e.target.value, 'cta')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">CTA Link</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            placeholder="https://example.com"
                                            value={item.cta.href}
                                            onChange={(e) => handleItemChange(index, 'href', e.target.value, 'cta')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium mb-2">Item Image</label>
                                    <button
                                        type="button"
                                        onClick={() => openMediaPickerForImage(index)}
                                        className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm"
                                    >
                                        Browse Media Library
                                    </button>
                                    
                                    <ImageUploadField
                                        value={item.img}
                                        onChange={(img) => {
                                            const updatedItems = [...formData.items];
                                            updatedItems[index].img = img;
                                            setFormData(prev => ({ ...prev, items: updatedItems }));
                                        }}
                                        folder="engage/public-events-volunteering/ways-get-involved"
                                        label="Or Upload New Image"
                                    />

                                    {/* Image Preview */}
                                    {item.img.src && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-2">Image Preview</label>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <img
                                                    src={item.img.src}
                                                    alt={item.img.alt}
                                                    className="h-32 w-auto object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="btn btn-outline-danger btn-xs mt-2"
                                                >
                                                    Remove Image
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {formData.items.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No items added yet. Click "Add Item" to get started.
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
                            {loading ? 'Updating...' : 'Update Ways Get Involved'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/engage/public-events-volunteering')}
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
                allowedTypes={mediaPickerType === 'file' ? ['raw'] : ['image']}
            />
        </ProtectedRoute>
    );
};

export default EditWaysGetInvolvedPage;