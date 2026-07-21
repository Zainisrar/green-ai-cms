'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import Loading from '@/components/layouts/loading';
import { useEngineeringProducts, useUpdateEngineeringProduct } from './hooks/useEngineeringProducts';
import { ProductFormData } from '@/lib/api/engineeringProducts';
import { uploadProductImage } from '@/lib/api/uploadProductImage';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

interface EditEngineeringProductProps {
    productId: string;
}

const EditEngineeringProduct: React.FC<EditEngineeringProductProps> = ({ productId }) => {
    const router = useRouter();
    const { data: products, isLoading } = useEngineeringProducts();
    const updateMutation = useUpdateEngineeringProduct();

    const [formData, setFormData] = useState<ProductFormData>({
        title: '',
        slug: '',
        description: '',
        imgs: [],
        ctaButton: { text: '', href: '' },
        keys: [],
    });

    const [isInitialized, setIsInitialized] = useState(false);

    // Media picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{ type: 'image' | 'keyIcon'; index: number } | null>(null);

    // CTA link type state
    const [ctaLinkType, setCtaLinkType] = useState<'navigation' | 'manual'>('manual');

    // Fetch navigation items
    const { data: navigationItems = [] } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    // Flatten navigation items for dropdown
    const flattenNavItems = (items: any[], prefix = ''): any[] => {
        let result: any[] = [];
        items.forEach((item) => {
            const displayName = prefix ? `${prefix} > ${item.name}` : item.name;
            result.push({ ...item, displayName });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenNavItems(item.children, displayName));
            }
        });
        return result;
    };

    const allNavItems = flattenNavItems(navigationItems);

    // Open media picker
    const openMediaPicker = (type: 'image' | 'keyIcon', index: number) => {
        setMediaPickerTarget({ type, index });
        setShowMediaPicker(true);
    };

    // Handle media selection
    const handleMediaSelect = (url: string, file?: any) => {
        if (!mediaPickerTarget) return;

        const { type, index } = mediaPickerTarget;

        if (type === 'image') {
            const newImgs = [...formData.imgs];
            newImgs[index] = { ...newImgs[index], src: url, alt: file?.alt || newImgs[index].alt };
            setFormData({ ...formData, imgs: newImgs });
        } else if (type === 'keyIcon') {
            const newKeys = [...formData.keys];
            newKeys[index] = {
                ...newKeys[index],
                icon: { ...newKeys[index].icon, src: url, alt: file?.alt || newKeys[index].icon.alt },
            };
            setFormData({ ...formData, keys: newKeys });
        }

        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    useEffect(() => {
        if (products && !isInitialized) {
            const product = products.find(p => p.id === parseInt(productId));
            if (product) {
                setFormData({
                    title: product.title,
                    slug: product.slug || '',
                    description: product.description,
                    imgs: product.imgs || [],
                    ctaButton: product.ctaButton || { text: '', href: '' },
                    keys: product.keys || [],
                });
                setIsInitialized(true);
            }
        }
    }, [products, productId, isInitialized]);



    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            Swal.fire({
                title: 'Uploading...',
                text: 'Please wait while we upload your image',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const result = await uploadProductImage(file);

            const newImgs = [...formData.imgs];
            newImgs[index] = { ...newImgs[index], src: result.url };
            setFormData({ ...formData, imgs: newImgs });

            Swal.close();
            Swal.fire({
                title: 'Success!',
                text: 'Image uploaded successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.close();
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
            });
        }
    };

    const addImage = () => {
        setFormData({
            ...formData,
            imgs: [...formData.imgs, { src: '', alt: '' }],
        });
    };

    const removeImage = (index: number) => {
        const newImgs = formData.imgs.filter((_, i) => i !== index);
        setFormData({ ...formData, imgs: newImgs });
    };

    const updateImage = (index: number, field: 'src' | 'alt', value: string) => {
        const newImgs = [...formData.imgs];
        newImgs[index] = { ...newImgs[index], [field]: value };
        setFormData({ ...formData, imgs: newImgs });
    };

    const addKey = () => {
        setFormData({
            ...formData,
            keys: [...formData.keys, { icon: { src: '', alt: '' }, title: '', description: '' }],
        });
    };

    const removeKey = (index: number) => {
        const newKeys = formData.keys.filter((_, i) => i !== index);
        setFormData({ ...formData, keys: newKeys });
    };

    const updateKey = (index: number, field: 'title' | 'description', value: string) => {
        const newKeys = [...formData.keys];
        newKeys[index] = { ...newKeys[index], [field]: value };
        setFormData({ ...formData, keys: newKeys });
    };

    const updateKeyIcon = (index: number, field: 'src' | 'alt', value: string) => {
        const newKeys = [...formData.keys];
        newKeys[index] = { ...newKeys[index], icon: { ...newKeys[index].icon, [field]: value } };
        setFormData({ ...formData, keys: newKeys });
    };

    // Handle key icon upload
    const handleKeyIconUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            Swal.fire({
                title: 'Uploading...',
                text: 'Please wait while we upload your icon',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const result = await uploadProductImage(file);

            const newKeys = [...formData.keys];
            newKeys[index] = { ...newKeys[index], icon: { ...newKeys[index].icon, src: result.url } };
            setFormData({ ...formData, keys: newKeys });

            Swal.close();
            Swal.fire({
                title: 'Success!',
                text: 'Icon uploaded successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.close();
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload icon';
            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in all required fields',
                icon: 'error',
            });
            return;
        }

        try {
            await updateMutation.mutateAsync({
                id: parseInt(productId),
                data: formData,
            });
            Swal.fire({
                title: 'Success!',
                text: 'Product updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            router.push('/apps/engineering/products');
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update product',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!isInitialized && products) {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) {
            return (
                <div className="panel">
                    <div className="text-center py-10">
                        <p className="text-red-500">Product not found</p>
                        <button onClick={handleBack} className="btn btn-primary mt-4">
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleBack}>
                        <IconArrowBackward className="h-4 w-4 mr-1" />
                        Back
                    </button>
                    <h5 className="text-lg font-semibold dark:text-white-light">Edit Product</h5>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="form-label">Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter product title"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Slug</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="product-slug (auto-generated from title if empty)"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Leave empty to auto-generate from title. Used for URLs.
                        </p>
                    </div>
                    <div>
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter product description"
                            required
                        />
                    </div>
                </div>

                {/* Images Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="form-label">Images</label>
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={addImage}>
                            <IconPlus className="h-4 w-4 mr-1" />
                            Add Image
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.imgs.map((img, index) => (
                            <div key={index} className="border rounded p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium">Image {index + 1}</h6>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeImage(index)}
                                    >
                                        <IconTrash className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label text-sm">Image URL</label>
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => openMediaPicker('image', index)}
                                                className="btn btn-outline-primary btn-sm w-full"
                                            >
                                                Browse Media
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, index)}
                                                    className="hidden"
                                                    id={`image-upload-${index}`}
                                                />
                                                <label
                                                    htmlFor={`image-upload-${index}`}
                                                    className="btn btn-outline-primary btn-sm cursor-pointer"
                                                >
                                                    <IconCloudDownload className="h-4 w-4 mr-1" />
                                                    Upload Image
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={img.src}
                                                onChange={(e) => updateImage(index, 'src', e.target.value)}
                                                placeholder="Or paste URL manually"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label text-sm">Alt Text</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={img.alt}
                                            onChange={(e) => updateImage(index, 'alt', e.target.value)}
                                            placeholder="Alt text for accessibility"
                                        />
                                    </div>
                                </div>
                                {img.src && (
                                    <div className="mt-3">
                                        <label className="form-label text-sm">Preview</label>
                                        <div className="border rounded p-2 bg-gray-50">
                                            <img
                                                src={img.src}
                                                alt={img.alt || 'Preview'}
                                                className="max-w-full h-32 object-cover rounded"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <div>
                    <label className="form-label">Call-to-Action Button</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label text-sm">Button Text</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.ctaButton.text}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ctaButton: { ...formData.ctaButton, text: e.target.value },
                                    })
                                }
                                placeholder="Learn More"
                            />
                        </div>
                        <div>
                            <label className="form-label text-sm">Link Type</label>
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
                                    value={formData.ctaButton.href}
                                    onChange={(e) => {
                                        const selectedNav = allNavItems.find((item) => item.slug === e.target.value);
                                        setFormData({
                                            ...formData,
                                            ctaButton: { ...formData.ctaButton, href: selectedNav?.slug || '' },
                                        });
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
                                    type="text"
                                    className="form-input"
                                    value={formData.ctaButton.href}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            ctaButton: { ...formData.ctaButton, href: e.target.value },
                                        })
                                    }
                                    placeholder="https://example.com or /path"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Features */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="form-label">Key Features</label>
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={addKey}>
                            <IconPlus className="h-4 w-4 mr-1" />
                            Add Feature
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.keys.map((key, index) => (
                            <div key={index} className="border rounded p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium">Feature {index + 1}</h6>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeKey(index)}
                                    >
                                        <IconTrash className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {/* Icon Upload Section */}
                                    <div>
                                        <label className="form-label text-sm">Icon Image</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="form-label text-xs">Icon URL</label>
                                                <div className="space-y-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openMediaPicker('keyIcon', index)}
                                                        className="btn btn-outline-primary btn-sm w-full"
                                                    >
                                                        Browse Media
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleKeyIconUpload(e, index)}
                                                            className="hidden"
                                                            id={`key-icon-upload-${index}`}
                                                        />
                                                        <label
                                                            htmlFor={`key-icon-upload-${index}`}
                                                            className="btn btn-outline-primary btn-sm cursor-pointer"
                                                        >
                                                            <IconCloudDownload className="h-4 w-4 mr-1" />
                                                            Upload Icon
                                                        </label>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={key.icon?.src || ''}
                                                        onChange={(e) => updateKeyIcon(index, 'src', e.target.value)}
                                                        placeholder="Or paste URL manually"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="form-label text-xs">Icon Alt Text</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={key.icon?.alt || ''}
                                                    onChange={(e) => updateKeyIcon(index, 'alt', e.target.value)}
                                                    placeholder="Alt text for icon"
                                                />
                                            </div>
                                        </div>
                                        {/* Icon Preview */}
                                        {key.icon?.src && (
                                            <div className="mt-2">
                                                <label className="form-label text-xs">Icon Preview</label>
                                                <div className="border rounded p-2 bg-gray-50 inline-block">
                                                    <img
                                                        src={key.icon.src}
                                                        alt={key.icon.alt || 'Icon Preview'}
                                                        className="w-8 h-8 object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title and Description */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label text-sm">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={key.title}
                                                onChange={(e) => updateKey(index, 'title', e.target.value)}
                                                placeholder="Feature title"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label text-sm">Description</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={key.description}
                                                onChange={(e) => updateKey(index, 'description', e.target.value)}
                                                placeholder="Feature description"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button type="button" className="btn btn-outline-danger" onClick={handleBack}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setMediaPickerTarget(null);
                    }}
                    onSelect={handleMediaSelect}
                    title={
                        mediaPickerTarget?.type === 'image'
                            ? `Select Image ${mediaPickerTarget.index + 1}`
                            : mediaPickerTarget?.type === 'keyIcon'
                            ? `Select Icon for Feature ${mediaPickerTarget.index + 1}`
                            : 'Select Media'
                    }
                />
            )}
        </div>
    );
};

export default EditEngineeringProduct;