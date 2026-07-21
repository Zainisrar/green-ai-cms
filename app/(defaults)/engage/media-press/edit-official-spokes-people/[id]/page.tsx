'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconX from '@/components/icon/icon-x';
import IconFolder from '@/components/icon/icon-folder';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface OfficialSpokesPeopleData {
    title: string;
    items: Array<{
        img: {
            src: string;
            alt: string;
        };
        title: string;
        video: string;
        member: {
            name: string;
            designation: string;
        };
    }>;
}

const EditOfficialSpokesPeoplePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showVideoPicker, setShowVideoPicker] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const { uploadVideo, isUploading: isUploadingVideo, uploadError: videoUploadError } = useVideoUpload();
    
    const [formData, setFormData] = useState<OfficialSpokesPeopleData>({
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
            if (result.success && result.data.officialSpokesPeople) {
                setFormData(result.data.officialSpokesPeople);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof OfficialSpokesPeopleData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addSpokesPerson = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                img: { src: '', alt: '' },
                title: '',
                video: '',
                member: { name: '', designation: '' }
            }]
        }));
    };

    const updateSpokesPerson = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    if (field === 'imgSrc') {
                        return { ...item, img: { ...item.img, src: value } };
                    } else if (field === 'imgAlt') {
                        return { ...item, img: { ...item.img, alt: value } };
                    } else if (field === 'memberName') {
                        return { ...item, member: { ...item.member, name: value } };
                    } else if (field === 'memberDesignation') {
                        return { ...item, member: { ...item.member, designation: value } };
                    } else if (field === 'video') {
                        return { ...item, video: value };
                    } else {
                        return { ...item, [field]: value };
                    }
                }
                return item;
            })
        }));
    };

    const removeSpokesPerson = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (index: number, file: File) => {
        setUploadingIndex(index);
        try {
            const result = await uploadImage(file, 'media-press/spokesperson');
            if (result?.url) {
                updateSpokesPerson(index, 'imgSrc', result.url);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveImage = (index: number) => {
        updateSpokesPerson(index, 'imgSrc', '');
        updateSpokesPerson(index, 'imgAlt', '');
    };

    const handleVideoUpload = async (index: number, file: File) => {
        setUploadingVideoIndex(index);
        try {
            const result = await uploadVideo(file, 'media-press/spokesperson');
            if (result?.url) {
                updateSpokesPerson(index, 'video', result.url);
            }
        } catch (error) {
            console.error('Video upload failed:', error);
            Swal.fire('Error', 'Failed to upload video', 'error');
        } finally {
            setUploadingVideoIndex(null);
        }
    };

    const handleRemoveVideo = (index: number) => {
        updateSpokesPerson(index, 'video', '');
    };

    const openImagePicker = (index: number) => {
        setCurrentIndex(index);
        setShowImagePicker(true);
    };

    const openVideoPicker = (index: number) => {
        setCurrentIndex(index);
        setShowVideoPicker(true);
    };

    const handleImageSelect = (url: string) => {
        if (currentIndex !== null) {
            updateSpokesPerson(currentIndex, 'imgSrc', url);
        }
        setShowImagePicker(false);
        setCurrentIndex(null);
    };

    const handleVideoSelect = (url: string) => {
        if (currentIndex !== null) {
            updateSpokesPerson(currentIndex, 'video', url);
        }
        setShowVideoPicker(false);
        setCurrentIndex(null);
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
                officialSpokesPeople: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Official Spokes People section updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Official Spokes People</h5>
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

                    {/* Spokes People */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Spokes People</h6>
                            <button
                                type="button"
                                onClick={addSpokesPerson}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Spokes Person
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Spokes Person {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeSpokesPerson(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Section Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g., CEO & Founder"
                                                value={item.title}
                                                onChange={(e) => updateSpokesPerson(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Member Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter member name"
                                                value={item.member.name}
                                                onChange={(e) => updateSpokesPerson(index, 'memberName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Member Designation</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter designation"
                                                value={item.member.designation}
                                                onChange={(e) => updateSpokesPerson(index, 'memberDesignation', e.target.value)}
                                            />
                                        </div>
                                        
                                        {/* Image Upload */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Spokesperson Photo</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(index, file);
                                                            }}
                                                            className="form-input flex-1"
                                                            disabled={uploadingIndex === index}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => openImagePicker(index)}
                                                            className="btn btn-outline-primary whitespace-nowrap"
                                                            title="Browse from Media Library"
                                                        >
                                                            <IconFolder className="w-4 h-4 mr-1" />
                                                            Browse
                                                        </button>
                                                    </div>
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
                                                                className="h-32 w-32 object-cover rounded-full bg-gray-100 dark:bg-gray-800"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(index)}
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
                                                        onChange={(e) => updateSpokesPerson(index, 'imgAlt', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Video Upload */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Spokesperson Video</label>
                                            <div>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleVideoUpload(index, file);
                                                        }}
                                                        className="form-input flex-1"
                                                        disabled={uploadingVideoIndex === index}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => openVideoPicker(index)}
                                                        className="btn btn-outline-primary whitespace-nowrap"
                                                        title="Browse from Media Library"
                                                    >
                                                        <IconFolder className="w-4 h-4 mr-1" />
                                                        Browse
                                                    </button>
                                                </div>
                                                {uploadingVideoIndex === index && (
                                                    <p className="text-sm text-blue-500 mt-1">Uploading video...</p>
                                                )}
                                                {videoUploadError && uploadingVideoIndex === index && (
                                                    <p className="text-sm text-red-500 mt-1">{videoUploadError}</p>
                                                )}
                                                
                                                {item.video && (
                                                    <div className="mt-2">
                                                        <div className="relative inline-block">
                                                            <video
                                                                src={item.video}
                                                                controls
                                                                className="h-48 rounded-lg bg-gray-100 dark:bg-gray-800"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveVideo(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                                <IconX className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Member Info Preview */}
                                    {(item.member.name || item.member.designation) && (
                                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <h6 className="font-medium">{item.member.name}</h6>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.member.designation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {formData.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No spokes people added yet. Click "Add Spokes Person" to get started.</p>
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
                            {loading ? 'Updating...' : 'Update Official Spokes People'}
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

            {/* Image Picker Modal */}
            <MediaPicker
                isOpen={showImagePicker}
                onClose={() => {
                    setShowImagePicker(false);
                    setCurrentIndex(null);
                }}
                onSelect={handleImageSelect}
                title="Select Spokesperson Image"
                allowedTypes={['image']}
            />

            {/* Video Picker Modal */}
            <MediaPicker
                isOpen={showVideoPicker}
                onClose={() => {
                    setShowVideoPicker(false);
                    setCurrentIndex(null);
                }}
                onSelect={handleVideoSelect}
                title="Select Spokesperson Video"
                allowedTypes={['video']}
            />
        </ProtectedRoute>
    );
};

export default EditOfficialSpokesPeoplePage;