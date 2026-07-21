'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEnlightenReportsWhitepapers, useUpdateEnlightenReportsWhitepaper } from './hooks/useEnlightenReportsWhitepapers';
import { EnlightenReportsWhitepaper } from '@/db/schema';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';

import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '../../explore/about-us/hooks/useImageUpload';
import { useDocumentUpload } from './hooks/useDocumentUpload';
import Loading from '@/components/layouts/loading';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

interface EditEnlightenReportsWhitepaperProps {
    reportId: number;
}

const EditEnlightenReportsWhitepaper: React.FC<EditEnlightenReportsWhitepaperProps> = ({ reportId }) => {
    const router = useRouter();
    const { data: reports, isLoading } = useEnlightenReportsWhitepapers();
    const { mutate: updateReport, isPending } = useUpdateEnlightenReportsWhitepaper();
    const { uploadImage, isUploading } = useImageUpload();
    const { uploadDocument, isUploading: isDocumentUploading } = useDocumentUpload();

    const [formData, setFormData] = useState<EnlightenReportsWhitepaper | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImages, setFeaturedImages] = useState<ImageListType>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'featuredImg' | 'pptx'>('featuredImg');
    const [ctaLinkType, setCtaLinkType] = useState<'navigation' | 'manual'>('navigation');

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

    const openMediaPicker = (target: 'featuredImg' | 'pptx') => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (url: string, file?: any) => {
        if (!formData) return;
        
        if (mediaPickerTarget === 'featuredImg') {
            setFormData(prev => prev ? ({
                ...prev,
                featuredImg: {
                    src: url,
                    alt: prev.featuredImg?.alt || ''
                }
            }) : null);
            setFeaturedImages([{
                dataURL: url,
                file: undefined
            }]);
        } else if (mediaPickerTarget === 'pptx') {
            setFormData(prev => prev ? ({
                ...prev,
                pptx: url
            }) : null);
        }
        setShowMediaPicker(false);
    };

    // Find the report to edit
    useEffect(() => {
        if (reports && reportId) {
            const report = reports.find(r => r.id === reportId);
            if (report) {
                setFormData(report);
                
                // Set existing image if available
                if (report.featuredImg?.src) {
                    setFeaturedImages([{
                        dataURL: report.featuredImg.src,
                        file: undefined
                    }]);
                }
                
                // File is already set in formData.pptx
            }
        }
    }, [reports, reportId]);

    const handleInputChange = (field: string, value: any) => {
        if (!formData) return;
        
        setFormData(prev => prev ? ({
            ...prev,
            [field]: value
        }) : null);
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedInputChange = (parent: string, field: string, value: string) => {
        if (!formData) return;
        
        setFormData(prev => prev ? ({
            ...prev,
            [parent]: {
                ...prev[parent as keyof typeof prev] as any,
                [field]: value
            }
        }) : null);
    };

    const handleFeaturedImageChange = async (imageList: ImageListType) => {
        setFeaturedImages(imageList);
        
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'enlighten/reports');
                setFormData(prev => prev ? ({
                    ...prev,
                    featuredImg: {
                        src: result.url,
                        alt: prev.featuredImg?.alt || ''
                    }
                }) : null);
            } catch (error) {
                console.error('Error uploading image:', error);
                setErrors(prev => ({ ...prev, featuredImg: 'Failed to upload image' }));
            }
        } else if (imageList.length === 0) {
            setFormData(prev => prev ? ({
                ...prev,
                featuredImg: null
            }) : null);
        }
    };



    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            try {
                const result = await uploadDocument(file, 'enlighten/reports/files');
                setFormData(prev => prev ? ({
                    ...prev,
                    pptx: result.url
                }) : null);
                setErrors(prev => ({ ...prev, pptx: '' }));
            } catch (error) {
                console.error('Error uploading file:', error);
                setErrors(prev => ({ ...prev, pptx: 'Failed to upload file' }));
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFormData(prev => prev ? ({
            ...prev,
            pptx: ''
        }) : null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        if (!formData) return false;
        
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.subtitle.trim()) {
            newErrors.subtitle = 'Subtitle is required';
        }

        if (!formData.year.trim()) {
            newErrors.year = 'Year is required';
        }

        if (!formData.pptx.trim()) {
            newErrors.pptx = 'File is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData || !validateForm()) {
            return;
        }

        updateReport(formData, {
            onSuccess: () => {
                router.push('/enlighten/reports-whitepapers');
            },
            onError: (error) => {
                console.error('Error updating report:', error);
                setErrors({ submit: error.message });
            },
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!formData) {
        return (
            <div className="panel">
                <div className="mb-5 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/enlighten/reports-whitepapers')}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white-light/40 hover:bg-white-light/60 dark:bg-dark/40 dark:hover:bg-dark/60 transition-colors"
                        title="Back to Reports"
                    >
                        <IconArrowBackward className="w-5 h-5" />
                    </button>
                    <h5 className="text-lg font-semibold dark:text-white-light">Edit Report & Whitepaper</h5>
                </div>
                <div className="text-center py-10">
                    <p className="text-red-500">Report not found</p>
                    <button 
                        onClick={() => router.push('/enlighten/reports-whitepapers')} 
                        className="btn btn-primary mt-4"
                    >
                        Back to Reports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => router.push('/enlighten/reports-whitepapers')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white-light/40 hover:bg-white-light/60 dark:bg-dark/40 dark:hover:bg-dark/60 transition-colors"
                    title="Back to Reports"
                >
                    <IconArrowBackward className="w-5 h-5" />
                </button>
                <h5 className="text-lg font-semibold dark:text-white-light">Edit Report & Whitepaper</h5>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {errors.submit}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                        Title *
                    </label>
                    <input
                        id="title"
                        type="text"
                        className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                        placeholder="Enter report title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Subtitle */}
                <div>
                    <label htmlFor="subtitle" className="block text-sm font-medium mb-2">
                        Subtitle *
                    </label>
                    <input
                        id="subtitle"
                        type="text"
                        className={`form-input ${errors.subtitle ? 'border-red-500' : ''}`}
                        placeholder="Enter report subtitle"
                        value={formData.subtitle}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    />
                    {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        className="form-textarea"
                        rows={3}
                        placeholder="Enter report description (optional)"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </div>

                {/* Year */}
                <div>
                    <label htmlFor="year" className="block text-sm font-medium mb-2">
                        Year *
                    </label>
                    <input
                        id="year"
                        type="text"
                        className={`form-input ${errors.year ? 'border-red-500' : ''}`}
                        placeholder="2024"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                    />
                    {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        File URL (PPTX/PDF) *
                    </label>
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => openMediaPicker('pptx')}
                            className="btn btn-primary"
                        >
                            Browse Media Library
                        </button>
                        {formData.pptx && (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                        <span className="text-blue-600 text-xs font-medium">FILE</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">
                                            {formData.pptx.split('/').pop() || 'File'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <a href={formData.pptx} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                View File
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('pptx', '')}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                    {errors.pptx && <p className="text-red-500 text-sm mt-1">{errors.pptx}</p>}
                </div>

                {/* Featured Image */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Featured Image Upload (Optional)
                        </label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => openMediaPicker('featuredImg')}
                                className="btn btn-outline-primary btn-sm"
                            >
                                Browse Media
                            </button>
                            <span className="self-center text-gray-500">or</span>
                        </div>
                        <ImageUploading 
                            value={featuredImages} 
                            onChange={handleFeaturedImageChange} 
                            maxNumber={1} 
                            dataURLKey="dataURL"
                        >
                            {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                <div className="space-y-2">
                                    {imageList.length === 0 ? (
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                                isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                                            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            <div className="space-y-2">
                                                <div className="text-gray-500">
                                                    {isUploading ? 'Uploading...' : 'Click or drag image here (Optional)'}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    Supports: JPG, PNG, GIF (Max: 10MB)
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {imageList.map((image, index) => (
                                                <div key={index} className="relative inline-block">
                                                    <img 
                                                        src={image.dataURL || formData?.featuredImg?.src} 
                                                        alt="Featured" 
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => onImageUpdate(index)}
                                                            className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
                                                            disabled={isUploading}
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onImageRemove(index)}
                                                            className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                                                            disabled={isUploading}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </ImageUploading>
                        {errors.featuredImg && <p className="text-red-500 text-sm mt-1">{errors.featuredImg}</p>}
                    </div>
                    
                    {formData.featuredImg && (
                        <div>
                            <label htmlFor="featuredImgAlt" className="block text-sm font-medium mb-2">
                                Featured Image Alt Text
                            </label>
                            <input
                                id="featuredImgAlt"
                                type="text"
                                className="form-input"
                                placeholder="Image description for accessibility"
                                value={formData.featuredImg?.alt || ''}
                                onChange={(e) => handleNestedInputChange('featuredImg', 'alt', e.target.value)}
                            />
                        </div>
                    )}
                </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => router.push('/enlighten/reports-whitepapers')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isPending || isUploading}
                    >
                        {isPending ? 'Updating...' : isUploading ? 'Uploading Image...' : 'Update Report'}
                    </button>
                </div>
            </form>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={handleMediaSelect}
                    title={mediaPickerTarget === 'featuredImg' ? 'Select Featured Image' : 'Select File (PPTX/PDF)'}
                    allowedTypes={mediaPickerTarget === 'featuredImg' ? ['image'] : ['raw']}
                    allowUrlInput={false}
                />
            )}
        </div>
    );
};

export default EditEnlightenReportsWhitepaper;