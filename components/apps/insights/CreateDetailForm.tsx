'use client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insightDetailApi, insightDetailKeys, CreateInsightDetailData, Keypoint, NavItem } from '@/lib/api/insightDetails';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

const CreateDetailForm = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<CreateInsightDetailData>({
        bgImg: '',
        backgroundImg: '',
        navigation: { items: [{ name: '', link: '' }] },
        title: '',
        subheadline: '',
        description: '',
        name1: '',
        name2: '',
        cardTitle: '',
        keypoints: [{ icon: '', text: '' }],
        slug: '',
        imageDirection: 'left'
    });

    const [backgroundImage, setBackgroundImage] = useState({ src: '', alt: '' });
    const [keypointImages, setKeypointImages] = useState<{ [key: number]: { src: string; alt: string } }>({
        0: { src: '', alt: '' }
    });
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'background' | number | null>(null);

    const createMutation = useMutation({
        mutationFn: insightDetailApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: insightDetailKeys.lists() });
            Swal.fire({
                title: 'Success!',
                text: 'Mining detail created successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                router.push('/insights/details');
            });
        },
        onError: () => {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to create mining detail.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!backgroundImage.src) {
            Swal.fire({
                title: 'Missing Image!',
                text: 'Please upload a background image before submitting.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Check if all keypoint icons are uploaded
        const missingIcons = formData.keypoints.some((_, index) => !keypointImages[index]?.src);
        if (missingIcons) {
            Swal.fire({
                title: 'Missing Icon Images!',
                text: 'Please upload icon images for all key points before submitting.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Update keypoints with uploaded icon images
        const updatedKeypoints = formData.keypoints.map((keypoint, index) => ({
            ...keypoint,
            icon: keypointImages[index]?.src || keypoint.icon
        }));
        
        const submitData = {
            ...formData,
            bgImg: backgroundImage.src,
            keypoints: updatedKeypoints
        };
        createMutation.mutate(submitData);
    };

    const handleInputChange = (field: keyof CreateInsightDetailData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Auto-generate slug when title changes
        if (field === 'title') {
            const slug = value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
            
            setFormData((prev) => ({
                ...prev,
                slug: `/insights/${slug}`,
            }));
        }
    };

    // Handle slug change - ensure it starts with /insights/
    const handleSlugChange = (value: string) => {
        // Remove /insights/ prefix if present to get the editable part
        let slugPart = value.replace(/^\/insights\//, '');
        
        // Clean the slug part
        slugPart = slugPart
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        
        setFormData((prev) => ({
            ...prev,
            slug: `/insights/${slugPart}`,
        }));
    };

    const handleNavItemChange = (index: number, field: keyof NavItem, value: string) => {
        const newItems = [...formData.navigation.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            navigation: { items: newItems }
        }));
    };

    const addNavItem = () => {
        setFormData(prev => ({
            ...prev,
            navigation: {
                items: [...prev.navigation.items, { name: '', link: '' }]
            }
        }));
    };

    const removeNavItem = (index: number) => {
        if (formData.navigation.items.length > 1) {
            const newItems = formData.navigation.items.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                navigation: { items: newItems }
            }));
        }
    };

    const handleKeypointChange = (index: number, field: keyof Keypoint, value: string) => {
        const newKeypoints = [...formData.keypoints];
        newKeypoints[index] = { ...newKeypoints[index], [field]: value };
        setFormData(prev => ({ ...prev, keypoints: newKeypoints }));
    };

    const addKeypoint = () => {
        const newIndex = formData.keypoints.length;
        setFormData(prev => ({
            ...prev,
            keypoints: [...prev.keypoints, { icon: '', text: '' }]
        }));
        setKeypointImages(prev => ({
            ...prev,
            [newIndex]: { src: '', alt: '' }
        }));
    };

    const removeKeypoint = (index: number) => {
        if (formData.keypoints.length > 1) {
            const newKeypoints = formData.keypoints.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, keypoints: newKeypoints }));
            
            // Remove the corresponding image and reindex
            const newKeypointImages: { [key: number]: { src: string; alt: string } } = {};
            Object.keys(keypointImages).forEach(key => {
                const keyIndex = parseInt(key);
                if (keyIndex < index) {
                    newKeypointImages[keyIndex] = keypointImages[keyIndex];
                } else if (keyIndex > index) {
                    newKeypointImages[keyIndex - 1] = keypointImages[keyIndex];
                }
            });
            setKeypointImages(newKeypointImages);
        }
    };

    const handleMediaSelect = (url: string) => {
        if (mediaPickerTarget === 'background') {
            setBackgroundImage({ src: url, alt: '' });
        } else if (typeof mediaPickerTarget === 'number') {
            setKeypointImages(prev => ({
                ...prev,
                [mediaPickerTarget]: { src: url, alt: '' }
            }));
        }
        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    const openMediaPicker = (target: 'background' | number) => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    return (
        <div className="space-y-8 pt-5">
            <div className="panel">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Create Banner Detail</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Add a new banner insight detail</p>
                    </div>
                    <Link
                        href="/insights/details"
                        className="btn btn-outline-primary"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Details
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Subheadline *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.subheadline}
                                onChange={(e) => handleInputChange('subheadline', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="form-label">Name 1 *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name1}
                                onChange={(e) => handleInputChange('name1', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Name 2 *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name2}
                                onChange={(e) => handleInputChange('name2', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Card Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.cardTitle}
                                onChange={(e) => handleInputChange('cardTitle', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Slug</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                                    /insights/
                                </div>
                                <input
                                    type="text"
                                    className="form-input pl-20"
                                    value={formData.slug?.replace(/^\/insights\//, '') || ''}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="your-slug"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Auto-generated from title. You can edit if needed.</p>
                        </div>
                        <div>
                            <label className="form-label">Image Direction</label>
                            <select
                                className="form-select"
                                value={formData.imageDirection || 'left'}
                                onChange={(e) => handleInputChange('imageDirection', e.target.value as 'left' | 'right')}
                            >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Background Image Class</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.backgroundImg}
                            onChange={(e) => handleInputChange('backgroundImg', e.target.value)}
                            placeholder="CSS background class (optional)"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="form-label mb-0">Background Image *</label>
                            <button
                                type="button"
                                onClick={() => openMediaPicker('background')}
                                className="btn btn-sm btn-outline-primary"
                            >
                                Browse Media Library
                            </button>
                        </div>
                        <ImageUploadField
                            value={backgroundImage}
                            onChange={setBackgroundImage}
                            folder="insights/details"
                            label=""
                            required
                        />
                    </div>

                    {/* Navigation Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="form-label mb-0">Navigation Items</label>
                            <button
                                type="button"
                                onClick={addNavItem}
                                className="btn btn-sm btn-primary"
                            >
                                Add Navigation Item
                            </button>
                        </div>
                        {formData.navigation.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                                <div>
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Navigation item name"
                                        value={item.name}
                                        onChange={(e) => handleNavItemChange(index, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Link</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Navigation item link"
                                        value={item.link}
                                        onChange={(e) => handleNavItemChange(index, 'link', e.target.value)}
                                        required
                                    />
                                    {formData.navigation.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeNavItem(index)}
                                            className="btn btn-sm btn-outline-danger mt-2"
                                        >
                                            Remove Navigation Item
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Keypoints Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="form-label mb-0">Key Points</label>
                            <button
                                type="button"
                                onClick={addKeypoint}
                                className="btn btn-sm btn-primary"
                            >
                                Add Key Point
                            </button>
                        </div>
                        {formData.keypoints.map((keypoint, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="form-label mb-0">Icon Image *</label>
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker(index)}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Browse
                                        </button>
                                    </div>
                                    <ImageUploadField
                                        value={keypointImages[index] || { src: '', alt: '' }}
                                        onChange={(value) => setKeypointImages(prev => ({ ...prev, [index]: value }))}
                                        folder="insights/details/icons"
                                        label=""
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Text</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Key point text"
                                        value={keypoint.text}
                                        onChange={(e) => handleKeypointChange(index, 'text', e.target.value)}
                                        required
                                    />
                                    {formData.keypoints.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeKeypoint(index)}
                                            className="btn btn-sm btn-outline-danger mt-2"
                                        >
                                            Remove Key Point
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-6">
                        <Link href="/insights/details" className="btn btn-outline-secondary">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Detail'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Media Picker Modal */}
            <MediaPicker
                isOpen={showMediaPicker}
                onClose={() => {
                    setShowMediaPicker(false);
                    setMediaPickerTarget(null);
                }}
                onSelect={handleMediaSelect}
                allowedTypes={['image']}
            />
        </div>
    );
};

export default CreateDetailForm;