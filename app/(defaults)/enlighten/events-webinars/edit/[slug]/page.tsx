'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '@/components/apps/explore/about-us/hooks/useImageUpload';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

interface EventImage {
    src: string;
    alt: string;
}

interface EventCTA {
    text: string;
    href: string;
}

interface UpcomingEvent {
    title: string;
    description: string;
    featuredImg: EventImage;
    slug: string;
    year: string;
    location: string;
    cta: EventCTA;
}

const EditEventPage = () => {
    const router = useRouter();
    const params = useParams();
    const eventSlug = params.slug as string;
    const { uploadImage, isUploading } = useImageUpload();
    
    const [loading, setLoading] = useState(false);
    const [fetchingEvent, setFetchingEvent] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImages, setFeaturedImages] = useState<ImageListType>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [ctaLinkType, setCtaLinkType] = useState<'navigation' | 'manual'>('navigation');
    
    const [formData, setFormData] = useState<UpcomingEvent>({
        title: '',
        description: '',
        featuredImg: { src: '', alt: '' },
        slug: '',
        year: new Date().getFullYear().toString(),
        location: '',
        cta: { text: '', href: '' }
    });

    // Fetch navigation items for CTA dropdown
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    // Flatten navigation items to show hierarchy
    const flattenNavItems = (items: any[], parent = ''): any[] => {
        let result: any[] = [];
        items.forEach(item => {
            const displayName = parent ? `${parent} > ${item.name}` : item.name;
            result.push({ ...item, displayName });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenNavItems(item.children, displayName));
            }
        });
        return result;
    };

    const allNavItems = navigationItems ? flattenNavItems(navigationItems) : [];

    const handleMediaSelect = (url: string, file?: any) => {
        setFormData(prev => ({
            ...prev,
            featuredImg: {
                ...prev.featuredImg,
                src: url
            }
        }));
        setFeaturedImages([{
            data_url: url,
            file: undefined
        }]);
        setShowMediaPicker(false);
    };

    useEffect(() => {
        fetchEventData();
    }, [eventSlug]);

    const fetchEventData = async () => {
        try {
            const result = await apiClient.get('/api/enlighten/events-webinars');
            if (result.success && result.data?.upcomingEvents) {
                const event = result.data.upcomingEvents.find((e: UpcomingEvent) => e.slug === eventSlug);
                if (event) {
                    setFormData(event);
                    if (event.featuredImg.src) {
                        setFeaturedImages([{ data_url: event.featuredImg.src }]);
                    }
                } else {
                    Swal.fire('Error', 'Event not found', 'error');
                    router.push('/enlighten/events-webinars');
                }
            }
        } catch (error: any) {
            console.error('Fetch event error:', error);
            Swal.fire('Error', 'Failed to fetch event data', 'error');
            router.push('/enlighten/events-webinars');
        } finally {
            setFetchingEvent(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Auto-generate slug from title
        if (field === 'title') {
            const generatedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedInputChange = (parent: 'featuredImg' | 'cta', field: string, value: string) => {
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

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug is required';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = async (imageList: ImageListType) => {
        setFeaturedImages(imageList);
        
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'events-webinars');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Fetch existing events data
            const existingResult = await apiClient.get('/api/enlighten/events-webinars');
            const existingData = existingResult.data;

            const updatedEvents = existingData?.upcomingEvents.map((event: UpcomingEvent) => 
                event.slug === eventSlug ? formData : event
            ) || [];

            const payload = {
                id: existingData?.id,
                upcomingEvents: updatedEvents,
                mainPage: existingData?.mainPage
            };

            const result = await apiClient.put('/api/enlighten/events-webinars', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Event updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/enlighten/events-webinars');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update event', 'error');
            }
        } catch (error: any) {
            console.error('Update event error:', error);
            Swal.fire('Error', error.message || 'Failed to update event', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingEvent) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'enlighten', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Event</h5>
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
                                placeholder="Enter event title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Slug *
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="event-slug"
                                value={formData.slug}
                                onChange={(e) => handleInputChange('slug', e.target.value)}
                            />
                            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
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
                            placeholder="Enter event description"
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

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Event location"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                        </div>
                    </div>

                    {/* Featured Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Featured Image
                        </label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setShowMediaPicker(true)}
                                className="btn btn-outline-primary btn-sm"
                            >
                                Browse Media
                            </button>
                            <span className="self-center text-gray-500">or</span>
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

                    {/* CTA Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                CTA Text
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Learn More"
                                value={formData.cta.text}
                                onChange={(e) => handleNestedInputChange('cta', 'text', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Link Type
                            </label>
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        checked={ctaLinkType === 'navigation'}
                                        onChange={() => setCtaLinkType('navigation')}
                                    />
                                    <span className="ml-2">Navigation</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        checked={ctaLinkType === 'manual'}
                                        onChange={() => setCtaLinkType('manual')}
                                    />
                                    <span className="ml-2">Manual URL</span>
                                </label>
                            </div>
                            {ctaLinkType === 'navigation' ? (
                                <select
                                    className="form-select"
                                    value={formData.cta.href}
                                    onChange={(e) => {
                                        const selectedNav = allNavItems.find((item) => item.slug === e.target.value);
                                        handleNestedInputChange('cta', 'href', selectedNav?.slug || '');
                                    }}
                                >
                                    <option value="">Select navigation item</option>
                                    {allNavItems.map((item) => (
                                        <option key={item.id} value={item.slug}>
                                            {item.displayName} - {item.slug}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://example.com or /path"
                                    value={formData.cta.href}
                                    onChange={(e) => handleNestedInputChange('cta', 'href', e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Updating...' : 'Update Event'}
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
                {showMediaPicker && (
                    <MediaPicker
                        isOpen={showMediaPicker}
                        onClose={() => setShowMediaPicker(false)}
                        onSelect={handleMediaSelect}
                        title="Select Featured Image"
                        allowedTypes={['image']}
                        allowUrlInput={false}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
};

export default EditEventPage;