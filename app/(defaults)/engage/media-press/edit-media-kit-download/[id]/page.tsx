'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconFolder from '@/components/icon/icon-folder';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface MediaKitDownloadData {
    title: string;
    kits: Array<{
        src: string;
        title: string;
    }>;
}

const EditMediaKitDownloadPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentKitIndex, setCurrentKitIndex] = useState<number | null>(null);
    
    const [formData, setFormData] = useState<MediaKitDownloadData>({
        title: '',
        kits: [],
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/media-press/${id}`);
            if (result.success && result.data.mediaKitDownload) {
                setFormData(result.data.mediaKitDownload);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof MediaKitDownloadData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addKit = () => {
        setFormData(prev => ({
            ...prev,
            kits: [...prev.kits, { src: '', title: '' }]
        }));
    };

    const updateKit = (index: number, field: 'src' | 'title', value: string) => {
        setFormData(prev => ({
            ...prev,
            kits: prev.kits.map((kit, i) => i === index ? { ...kit, [field]: value } : kit)
        }));
    };

    const removeKit = (index: number) => {
        setFormData(prev => ({
            ...prev,
            kits: prev.kits.filter((_, i) => i !== index)
        }));
    };

    const handleMediaSelect = (url: string) => {
        if (currentKitIndex !== null) {
            updateKit(currentKitIndex, 'src', url);
        }
        setShowMediaPicker(false);
        setCurrentKitIndex(null);
    };

    const openMediaPicker = (index: number) => {
        setCurrentKitIndex(index);
        setShowMediaPicker(true);
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
                mediaKitDownload: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Media Kit Download section updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Media Kit Download</h5>
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

                    {/* Media Kits */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Media Kits</h6>
                            <button
                                type="button"
                                onClick={addKit}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Media Kit
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.kits.map((kit, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Media Kit {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeKit(index)}
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
                                                placeholder="e.g., Company Logo Pack"
                                                value={kit.title}
                                                onChange={(e) => updateKit(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Download URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    className="form-input flex-1"
                                                    placeholder="https://example.com/media-kit.zip"
                                                    value={kit.src}
                                                    onChange={(e) => updateKit(index, 'src', e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => openMediaPicker(index)}
                                                    className="btn btn-outline-primary whitespace-nowrap"
                                                    title="Select from Media Library"
                                                >
                                                    <IconFolder className="w-4 h-4 mr-1" />
                                                    Browse
                                                </button>
                                            </div>
                                            <small className="text-gray-500 text-xs">Direct link to downloadable file or browse from media library</small>
                                        </div>
                                    </div>

                                    {/* Download Link Preview */}
                                    {kit.src && kit.title && (
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preview:</p>
                                            <a 
                                                href={kit.src} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {kit.title}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {formData.kits.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No media kits added yet. Click "Add Media Kit" to get started.</p>
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
                            {loading ? 'Updating...' : 'Update Media Kit Download'}
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

            {/* Media Picker Modal */}
            <MediaPicker
                isOpen={showMediaPicker}
                onClose={() => {
                    setShowMediaPicker(false);
                    setCurrentKitIndex(null);
                }}
                onSelect={handleMediaSelect}
                title="Select Media Kit File"
                allowedTypes={['raw']} // Only show documents/files, not images or videos
            />
        </ProtectedRoute>
    );
};

export default EditMediaKitDownloadPage;
