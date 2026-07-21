'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '@/components/apps/explore/about-us/hooks/useImageUpload';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface TeamGreenQuote {
    text: string;
    highlighted: string;
}

interface WhoWeAreModal {
    title: string;
    description: string;
    img: {
        src: string;
        alt: string;
        highlighted: string;
    };
    title2: string;
    description2: string;
    quote: TeamGreenQuote;
}

const EditWhoWeArePage = () => {
    const router = useRouter();
    const { uploadImage, isUploading } = useImageUpload();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [teamGreenId, setTeamGreenId] = useState<number | null>(null);
    const [otherData, setOtherData] = useState<any>(null);
    const [featuredImages, setFeaturedImages] = useState<ImageListType>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    
    const [formData, setFormData] = useState<WhoWeAreModal>({
        title: '',
        description: '',
        img: { src: '', alt: '', highlighted: '' },
        title2: '',
        description2: '',
        quote: { text: '', highlighted: '' }
    });

    useEffect(() => {
        fetchWhoWeAreData();
    }, []);

    const fetchWhoWeAreData = async () => {
        try {
            const result = await apiClient.get('/api/empower/team-green');
            if (result.success && result.data?.whoWeAreModal) {
                setFormData(result.data.whoWeAreModal);
                setTeamGreenId(result.data.id);
                setOtherData({
                    mainPage: result.data.mainPage,
                    ourLeadershipPhilosophy: result.data.ourLeadershipPhilosophy,
                    meetTeam: result.data.meetTeam,
                    ourCultureActionModal: result.data.ourCultureActionModal
                });
                
                if (result.data.whoWeAreModal.img.src) {
                    setFeaturedImages([{ data_url: result.data.whoWeAreModal.img.src }]);
                }
            } else {
                // Initialize with default values
                setFormData({
                    title: 'Who We Are',
                    description: 'We are a passionate team dedicated to green energy solutions.',
                    img: { src: '', alt: '', highlighted: 'green energy' },
                    title2: 'Our Mission',
                    description2: 'To create sustainable energy solutions for a better tomorrow.',
                    quote: { text: 'Innovation drives our mission', highlighted: 'Innovation' }
                });
            }
        } catch (error: any) {
            console.error('Fetch who we are data error:', error);
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

    const handleImageChange = (field: 'src' | 'alt' | 'highlighted', value: string) => {
        setFormData(prev => ({
            ...prev,
            img: { ...prev.img, [field]: value }
        }));
    };

    const handleQuoteChange = (field: 'text' | 'highlighted', value: string) => {
        setFormData(prev => ({
            ...prev,
            quote: { ...prev.quote, [field]: value }
        }));
    };

    const handleImageUpload = async (imageList: ImageListType) => {
        setFeaturedImages(imageList);
        
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'team-green');
                setFormData(prev => ({
                    ...prev,
                    img: {
                        ...prev.img,
                        src: result.url
                    }
                }));
            } catch (error) {
                console.error('Image upload error:', error);
                Swal.fire('Error', 'Failed to upload image', 'error');
            }
        }
    };

    const handleMediaSelect = (url: string) => {
        setFormData(prev => ({
            ...prev,
            img: {
                ...prev.img,
                src: url
            }
        }));
        setFeaturedImages([{ data_url: url }]);
        setShowMediaPicker(false);
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
                id: teamGreenId,
                mainPage: otherData?.mainPage,
                whoWeAreModal: formData,
                ourLeadershipPhilosophy: otherData?.ourLeadershipPhilosophy,
                meetTeam: otherData?.meetTeam,
                ourCultureActionModal: otherData?.ourCultureActionModal
            };

            const result = teamGreenId 
                ? await apiClient.put('/api/empower/team-green', payload)
                : await apiClient.post('/api/empower/team-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Who We Are section updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/empower/team-green');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update section', 'error');
            }
        } catch (error: any) {
            console.error('Update who we are error:', error);
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Who We Are</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1 */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Section 1</h4>
                        
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

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Featured Image</label>
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
                        
                        {/* Browse Media Library Button */}
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="mt-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            Browse Media Library
                        </button>
                    </div>

                    {/* Image Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Image Alt Text</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Image description"
                                value={formData.img.alt}
                                onChange={(e) => handleImageChange('alt', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Image Highlighted Text</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Highlighted text for image"
                                value={formData.img.highlighted}
                                onChange={(e) => handleImageChange('highlighted', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Section 2</h4>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Title 2</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter second title"
                                value={formData.title2}
                                onChange={(e) => handleInputChange('title2', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description 2</label>
                            <textarea
                                className="form-textarea"
                                rows={4}
                                placeholder="Enter second description"
                                value={formData.description2}
                                onChange={(e) => handleInputChange('description2', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Quote</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter quote"
                                    value={formData.quote.text}
                                    onChange={(e) => handleQuoteChange('text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Highlighted</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted part"
                                    value={formData.quote.highlighted}
                                    onChange={(e) => handleQuoteChange('highlighted', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Saving...' : 'Save Who We Are'}
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

                {/* Media Picker Modal */}
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={handleMediaSelect}
                    allowedTypes={['image']}
                    title="Select Image"
                />
            </div>
        </ProtectedRoute>
    );
};

export default EditWhoWeArePage;