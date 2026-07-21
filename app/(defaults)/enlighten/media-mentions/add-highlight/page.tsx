'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '@/components/apps/explore/about-us/hooks/useImageUpload';
import VideoUploadField from '@/components/shared/VideoUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface MediaMentionImage {
    src: string;
    alt: string;
}

interface MediaMentionHighlight {
    title: string;
    description: string;
    featuredImg: MediaMentionImage;
    video: string;
    year: string;
    datetime: string;
}

const AddHighlightPage = () => {
    const router = useRouter();
    const { uploadImage, isUploading } = useImageUpload();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImages, setFeaturedImages] = useState<ImageListType>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'video'>('image');
    
    const [formData, setFormData] = useState<MediaMentionHighlight>({
        title: '',
        description: '',
        featuredImg: { src: '', alt: '' },
        video: '',
        year: new Date().getFullYear().toString(),
        datetime: new Date().toISOString()
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedInputChange = (parent: 'featuredImg', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
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

    const handleImageUpload = async (imageList: ImageListType) => {
        setFeaturedImages(imageList);
        
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'media-mentions');
                setFormData(prev => ({
                    ...prev,
                    featuredImg: {
                        ...prev.featuredImg,
                        src: result.url
                    }
                }));
            } catch (error) {
                console.error('Image upload error:', error);
                Swal.fire('Error', 'Failed to upload image', 'error');
            }
        }
    };

    const openMediaPicker = (target: 'image' | 'video') => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (url: string, file?: any) => {
        if (mediaPickerTarget === 'image') {
            setFormData(prev => ({
                ...prev,
                featuredImg: {
                    ...prev.featuredImg,
                    src: url
                }
            }));
            setFeaturedImages([{
                dataURL: url,
                file: undefined
            }]);
        } else if (mediaPickerTarget === 'video') {
            setFormData(prev => ({ ...prev, video: url }));
        }
        setShowMediaPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // First fetch existing media mentions data
            const existingResult = await apiClient.get('/api/enlighten/media-mentions');
            const existingData = existingResult.data;

            const updatedHighlights = [...(existingData?.mainPage?.recentHighlights || []), formData];

            const updatedMainPage = {
                ...existingData?.mainPage,
                recentHighlights: updatedHighlights
            };

            const payload = {
                id: existingData?.id,
                mainPage: updatedMainPage || {
                    title: 'Media & Mentions',
                    subHeadline: 'In the News',
                    description: 'See how we are making headlines in the green energy sector.',
                    key: { text: 'Leading the conversation', highlighted: 'conversation' },
                    cta: [],
                    recentHighlights: [formData]
                }
            };

            const result = existingData?.id 
                ? await apiClient.put('/api/enlighten/media-mentions', payload)
                : await apiClient.post('/api/enlighten/media-mentions', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Highlight created successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/enlighten/media-mentions');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to create highlight', 'error');
            }
        } catch (error: any) {
            console.error('Create highlight error:', error);
            Swal.fire('Error', error.message || 'Failed to create highlight', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Add New Highlight</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter highlight title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>


                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description *
                        </label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            placeholder="Enter highlight description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Year */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Year
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="2024"
                                value={formData.year}
                                onChange={(e) => handleInputChange('year', e.target.value)}
                            />
                        </div>

                        {/* Date & Time */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={formData.datetime.slice(0, 16)}
                                onChange={(e) => handleInputChange('datetime', e.target.value + ':00.000Z')}
                            />
                        </div>
                    </div>

                    {/* Video Upload */}
                    <div>
                        <div className="border rounded-lg p-4">
                            <div className="mb-3">
                                <button
                                    type="button"
                                    onClick={() => openMediaPicker('video')}
                                    className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                >
                                    Browse Media Library (Video)
                                </button>
                            </div>
                            {formData.video && (
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600 mb-2">Selected Video:</p>
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm truncate flex-1">{formData.video}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, video: '' }))}
                                            className="text-red-600 hover:text-red-800 ml-2"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                            <VideoUploadField
                                value={formData.video}
                                onChange={(video) => setFormData(prev => ({ ...prev, video }))}
                                folder="enlighten/media-mentions"
                                label="Or Upload Video"
                            />
                        </div>
                    </div>

                    {/* Featured Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Featured Image (fallback if no video)
                        </label>
                        <div className="border rounded-lg p-4">
                            <div className="mb-3">
                                <button
                                    type="button"
                                    onClick={() => openMediaPicker('image')}
                                    className="btn btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                >
                                    Browse Media Library
                                </button>
                            </div>
                            <ImageUploading
                            value={featuredImages}
                            onChange={handleImageUpload}
                            maxNumber={1}
                            dataURLKey="data_url"
                        >
                            {({
                                imageList,
                                onImageUpload,
                                onImageUpdate,
                                onImageRemove,
                                isDragging,
                                dragProps,
                            }) => (
                                <div className="space-y-4">
                                    {imageList.length === 0 ? (
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                                isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                                            }`}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            <div className="space-y-2">
                                                <div className="text-gray-500">
                                                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                                                </div>
                                                <div className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {imageList.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={image.data_url}
                                                        alt="Featured"
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => onImageUpdate(index)}
                                                            className="btn btn-sm btn-primary bg-green-600 hover:bg-green-700"
                                                            disabled={isUploading}
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onImageRemove(index)}
                                                            className="btn btn-sm btn-danger"
                                                            disabled={isUploading}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    {isUploading && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                            <div className="text-white">Uploading...</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </ImageUploading>
                        </div>
                    </div>

                    {/* Image Alt Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Image Alt Text
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Image description"
                            value={formData.featuredImg.alt}
                            onChange={(e) => handleNestedInputChange('featuredImg', 'alt', e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Creating...' : 'Create Highlight'}
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

                {/* MediaPicker Modal */}
                {showMediaPicker && (
                    <MediaPicker
                        isOpen={showMediaPicker}
                        allowedTypes={mediaPickerTarget === 'image' ? ['image'] : ['video']}
                        onSelect={handleMediaSelect}
                        onClose={() => setShowMediaPicker(false)}
                        title={`Select ${mediaPickerTarget === 'image' ? 'Image' : 'Video'}`}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
};

export default AddHighlightPage;