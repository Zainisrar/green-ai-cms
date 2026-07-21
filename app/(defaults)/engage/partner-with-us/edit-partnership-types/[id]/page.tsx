'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface PartnershipTypesData {
    title: string;
    subHeadline: string;
    keys: Array<{
        icon: {
            src: string;
            alt: string;
        };
        title: string;
        description: string;
    }>;
}

const EditPartnershipTypesPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    
    const [formData, setFormData] = useState<PartnershipTypesData>({
        title: '',
        subHeadline: '',
        keys: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/partner-with-us/${id}`);
            if (result.success && result.data.modal.partnerShipTypes) {
                setFormData(result.data.modal.partnerShipTypes);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof PartnershipTypesData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addPartnershipType = () => {
        setFormData(prev => ({
            ...prev,
            keys: [...prev.keys, { 
                icon: { src: '', alt: '' },
                title: '', 
                description: '' 
            }]
        }));
    };

    const updatePartnershipType = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            keys: prev.keys.map((item, i) => {
                if (i === index) {
                    if (field === 'iconSrc') {
                        return { ...item, icon: { ...item.icon, src: value } };
                    } else if (field === 'iconAlt') {
                        return { ...item, icon: { ...item.icon, alt: value } };
                    } else {
                        return { ...item, [field]: value };
                    }
                }
                return item;
            })
        }));
    };

    const removePartnershipType = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keys: prev.keys.filter((_, i) => i !== index)
        }));
    };

    const openMediaPicker = (index: number) => {
        setCurrentImageIndex(index);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (media: any) => {
        if (currentImageIndex !== null) {
            updatePartnershipType(currentImageIndex, 'iconSrc', media.url);
        }
        setShowMediaPicker(false);
        setCurrentImageIndex(null);
    };

    const removeImage = (index: number) => {
        updatePartnershipType(index, 'iconSrc', '');
        updatePartnershipType(index, 'iconAlt', '');
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.subHeadline.trim()) {
            newErrors.subHeadline = 'Sub-headline is required';
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
            const result = await apiClient.patch(`/api/engage/partner-with-us/${id}`, {
                modal: { partnerShipTypes: formData }
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Partnership Types section updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/partner-with-us');
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
                            onClick={() => router.push('/engage/partner-with-us')}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Partnership Types</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <label className="block text-sm font-medium mb-2">Sub-Headline *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter sub-headline"
                                    value={formData.subHeadline}
                                    onChange={(e) => handleInputChange('subHeadline', e.target.value)}
                                />
                                {errors.subHeadline && <p className="text-red-500 text-sm mt-1">{errors.subHeadline}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Partnership Types */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Partnership Types</h6>
                            <button
                                type="button"
                                onClick={addPartnershipType}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Partnership Type
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.keys.map((partnershipType, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Partnership Type {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removePartnershipType(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium mb-2">Icon Image</label>
                                            <button
                                                type="button"
                                                onClick={() => openMediaPicker(index)}
                                                className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm w-full"
                                            >
                                                Browse Media Library
                                            </button>
                                            {partnershipType.icon.src && (
                                                <div className="space-y-2">
                                                    <img
                                                        src={partnershipType.icon.src}
                                                        alt={partnershipType.icon.alt || 'Partnership icon'}
                                                        className="rounded border w-full max-h-40 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="btn btn-outline-danger btn-xs"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            )}
                                            {!partnershipType.icon.src && (
                                                <p className="text-xs text-gray-500">No icon selected yet.</p>
                                            )}
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Icon Alt Text</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Alt text for accessibility"
                                                    value={partnershipType.icon.alt}
                                                    onChange={(e) => updatePartnershipType(index, 'iconAlt', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Enter partnership type title"
                                                    value={partnershipType.title}
                                                    onChange={(e) => updatePartnershipType(index, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={3}
                                                    placeholder="Enter description"
                                                    value={partnershipType.description}
                                                    onChange={(e) => updatePartnershipType(index, 'description', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.keys.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No partnership types added yet. Click "Add Partnership Type" to get started.</p>
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
                            {loading ? 'Updating...' : 'Update Partnership Types'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/engage/partner-with-us')}
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

export default EditPartnershipTypesPage;