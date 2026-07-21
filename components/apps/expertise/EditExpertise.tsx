'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { expertiseApi, expertiseKeys, UpdateExpertiseData, ExpertiseIcon, ExpertiseCarousel, ExpertiseKey } from '@/lib/api/expertise';
import { useUpdateExpertise } from '@/components/apps/expertise/hooks/useUpdateExpertise';
import Loading from '@/components/layouts/loading';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconTrash from '@/components/icon/icon-trash';
import IconPlus from '@/components/icon/icon-plus';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface EditExpertiseProps {
    id: string;
}

const EditExpertise = ({ id }: EditExpertiseProps) => {
    const router = useRouter();
    const [formData, setFormData] = useState<UpdateExpertiseData>({
        title: '',
        subtitle: '',
        highlighted: '',
        description: '',
        image: '',
        slug: '',
        highlightedTitle: '',
        subtitlePage: '',
        descriptionPage: '',
        icons: [],
        carousel: [],
        keys: []
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [mainImage, setMainImage] = useState<{ src: string; alt: string }>({ src: '', alt: '' });
    
    // State for dynamic arrays
    const [icons, setIcons] = useState<ExpertiseIcon[]>([]);
    const [carousel, setCarousel] = useState<ExpertiseCarousel[]>([]);
    const [keys, setKeys] = useState<ExpertiseKey[]>([]);

    // Media picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'main' | { type: 'icon' | 'carousel', index: number } | null>(null);

    const { data: expertise, isLoading, error, isError } = useQuery({
        queryKey: expertiseKeys.detail(id),
        queryFn: () => expertiseApi.getById(id),
        enabled: !!id,
    });

    const { mutate: updateExpertise, isPending: isUpdating } = useUpdateExpertise();

    useEffect(() => {
        if (expertise) {
            setFormData({
                title: expertise.title,
                subtitle: expertise.subtitle,
                highlighted: expertise.highlighted,
                description: expertise.description,
                image: expertise.image,
                slug: expertise.slug,
                highlightedTitle: expertise.highlightedTitle,
                subtitlePage: expertise.subtitlePage,
                descriptionPage: expertise.descriptionPage,
                icons: expertise.icons,
                carousel: expertise.carousel,
                keys: expertise.keys
            });
            setMainImage({ src: expertise.image, alt: expertise.title });
            setIcons(expertise.icons);
            setCarousel(expertise.carousel);
            setKeys(expertise.keys);
        }
    }, [expertise]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Validate main image
        if (!mainImage.src) {
            setFormError('Main image is required.');
            return;
        }

        // Validate required arrays
        if (icons.length === 0) {
            setFormError('At least one icon is required.');
            return;
        }
        if (carousel.length === 0) {
            setFormError('At least one carousel image is required.');
            return;
        }
        if (keys.length === 0) {
            setFormError('At least one key point is required.');
            return;
        }

        // Validate that all icons have required fields
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            if (!icon.img.src || !icon.img.alt || !icon.title || !icon.description) {
                setFormError(`Icon ${i + 1} is missing required fields.`);
                return;
            }
        }

        // Validate that all carousel items have required fields
        for (let i = 0; i < carousel.length; i++) {
            const item = carousel[i];
            if (!item.img.src || !item.img.alt) {
                setFormError(`Carousel image ${i + 1} is missing required fields.`);
                return;
            }
        }

        // Validate that all keys have text
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!key.text.trim()) {
                setFormError(`Key point ${i + 1} cannot be empty.`);
                return;
            }
        }
        
        try {
            const expertiseData = {
                ...formData,
                image: mainImage.src,
                icons,
                carousel,
                keys,
            };

            updateExpertise(
                { id, data: expertiseData },
                {
                    onSuccess: () => {
                        router.push('/expertise');
                    },
                    onError: (error: any) => {
                        setFormError(error.message || 'Failed to update expertise entry');
                    },
                }
            );
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormError('An unexpected error occurred. Please try again.');
        }
    };

    const handleInputChange = (field: keyof UpdateExpertiseData, value: any) => {
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
                slug: `/expertise/${slug}`,
            }));
        }
    };

    // Handle slug change - ensure it starts with /expertise/
    const handleSlugChange = (value: string) => {
        // Remove /expertise/ prefix if present to get the editable part
        let slugPart = value.replace(/^\/expertise\//, '');
        
        // Clean the slug part
        slugPart = slugPart
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        
        setFormData((prev) => ({
            ...prev,
            slug: `/expertise/${slugPart}`,
        }));
    };

    // Icon management functions
    const addIcon = () => {
        const newIcon: ExpertiseIcon = {
            img: { src: '', alt: '' },
            title: '',
            description: ''
        };
        setIcons([...icons, newIcon]);
    };

    const updateIcon = (index: number, field: keyof ExpertiseIcon, value: any) => {
        const updatedIcons = [...icons];
        if (field === 'img') {
            updatedIcons[index].img = value;
        } else {
            updatedIcons[index][field] = value;
        }
        setIcons(updatedIcons);
    };

    const removeIcon = (index: number) => {
        setIcons(icons.filter((_, i) => i !== index));
    };

    // Carousel management functions
    const addCarouselItem = () => {
        const newItem: ExpertiseCarousel = {
            img: { src: '', alt: '' }
        };
        setCarousel([...carousel, newItem]);
    };

    const updateCarouselItem = (index: number, img: { src: string; alt: string }) => {
        const updatedCarousel = [...carousel];
        updatedCarousel[index].img = img;
        setCarousel(updatedCarousel);
    };

    const removeCarouselItem = (index: number) => {
        setCarousel(carousel.filter((_, i) => i !== index));
    };

    // Keys management functions
    const addKey = () => {
        const newKey: ExpertiseKey = { text: '' };
        setKeys([...keys, newKey]);
    };

    const updateKey = (index: number, text: string) => {
        const updatedKeys = [...keys];
        updatedKeys[index].text = text;
        setKeys(updatedKeys);
    };

    const removeKey = (index: number) => {
        setKeys(keys.filter((_, i) => i !== index));
    };

    // Media picker handlers
    const handleMediaSelect = (url: string) => {
        if (mediaPickerTarget === 'main') {
            setMainImage({ src: url, alt: '' });
        } else if (mediaPickerTarget && typeof mediaPickerTarget === 'object') {
            if (mediaPickerTarget.type === 'icon') {
                updateIcon(mediaPickerTarget.index, 'img', { src: url, alt: '' });
            } else if (mediaPickerTarget.type === 'carousel') {
                updateCarouselItem(mediaPickerTarget.index, { src: url, alt: '' });
            }
        }
        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    const openMediaPicker = (target: 'main' | { type: 'icon' | 'carousel', index: number }) => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    if (isLoading) return <Loading />;
    
    if (isError) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-10">
                    <p className="text-red-500">Error loading expertise: {error?.message}</p>
                    <button 
                        onClick={() => router.push('/expertise')} 
                        className="btn btn-primary mt-4"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => router.push('/expertise')}
                    className="cursor-pointer hover:text-primary transition-colors"
                >
                    <IconArrowBackward width={30} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Expertise
                </h1>
            </div>

            {/* Form */}
            <div className="panel">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {formError}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subtitle *
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Highlighted Text *
                            </label>
                            <input
                                type="text"
                                value={formData.highlighted}
                                onChange={(e) => handleInputChange('highlighted', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Slug *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                                    /expertise/
                                </div>
                                <input
                                    type="text"
                                    value={formData.slug.replace(/^\/expertise\//, '')}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    className="form-input pl-24"
                                    placeholder="your-slug"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Auto-generated from title. You can edit if needed.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="form-textarea"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-0">Main Image *</label>
                            <button
                                type="button"
                                onClick={() => openMediaPicker('main')}
                                className="btn btn-sm btn-outline-primary"
                            >
                                Browse Media Library
                            </button>
                        </div>
                        <ImageUploadField
                            value={mainImage}
                            onChange={setMainImage}
                            folder="expertise"
                            label=""
                            required={true}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Highlighted Title *
                            </label>
                            <input
                                type="text"
                                value={formData.highlightedTitle}
                                onChange={(e) => handleInputChange('highlightedTitle', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subtitle Page *
                            </label>
                            <input
                                type="text"
                                value={formData.subtitlePage}
                                onChange={(e) => handleInputChange('subtitlePage', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description Page *
                        </label>
                        <textarea
                            value={formData.descriptionPage}
                            onChange={(e) => handleInputChange('descriptionPage', e.target.value)}
                            className="form-textarea"
                            rows={4}
                            required
                        />
                    </div>

                    {/* Icons Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icons *</label>
                            <button type="button" onClick={addIcon} className="btn btn-primary btn-sm">
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add Icon
                            </button>
                        </div>
                        {icons.map((icon, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Icon {index + 1}</h4>
                                    <button type="button" onClick={() => removeIcon(index)} className="text-red-500 hover:text-red-700">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-0">Icon Image *</label>
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker({ type: 'icon', index })}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Browse
                                        </button>
                                    </div>
                                    <ImageUploadField
                                        value={icon.img}
                                        onChange={(img) => updateIcon(index, 'img', img)}
                                        folder="expertise/icons"
                                        label=""
                                        required={true}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        value={icon.title} 
                                        onChange={(e) => updateIcon(index, 'title', e.target.value)}
                                        className="form-input" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea 
                                        value={icon.description} 
                                        onChange={(e) => updateIcon(index, 'description', e.target.value)}
                                        className="form-textarea" 
                                        rows={2} 
                                        required 
                                    />
                                </div>
                            </div>
                        ))}
                        {icons.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 text-sm mb-3">No icons added yet</p>
                                <button type="button" onClick={addIcon} className="btn btn-outline-primary btn-sm">
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add Your First Icon
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Carousel Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carousel Images *</label>
                            <button type="button" onClick={addCarouselItem} className="btn btn-primary btn-sm">
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add Image
                            </button>
                        </div>
                        {carousel.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Carousel Image {index + 1}</h4>
                                    <button type="button" onClick={() => removeCarouselItem(index)} className="text-red-500 hover:text-red-700">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-0">Carousel Image *</label>
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker({ type: 'carousel', index })}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Browse
                                        </button>
                                    </div>
                                    <ImageUploadField
                                        value={item.img}
                                        onChange={(img) => updateCarouselItem(index, img)}
                                        folder="expertise/carousel"
                                        label=""
                                        required={true}
                                    />
                                </div>
                            </div>
                        ))}
                        {carousel.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 text-sm mb-3">No carousel images added yet</p>
                                <button type="button" onClick={addCarouselItem} className="btn btn-outline-primary btn-sm">
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add Your First Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Keys Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key Points *</label>
                            <button type="button" onClick={addKey} className="btn btn-primary btn-sm">
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add Key
                            </button>
                        </div>
                        {keys.map((key, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Key Point {index + 1}</h4>
                                    <button type="button" onClick={() => removeKey(index)} className="text-red-500 hover:text-red-700">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text</label>
                                    <input 
                                        type="text" 
                                        value={key.text} 
                                        onChange={(e) => updateKey(index, e.target.value)}
                                        className="form-input" 
                                        required 
                                    />
                                </div>
                            </div>
                        ))}
                        {keys.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 text-sm mb-3">No key points added yet</p>
                                <button type="button" onClick={addKey} className="btn btn-outline-primary btn-sm">
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add Your First Key Point
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => router.push('/expertise')}
                            className="btn btn-outline-danger"
                            disabled={isUpdating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Update Expertise'}
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

export default EditExpertise;