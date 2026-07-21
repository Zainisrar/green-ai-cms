'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEnlightenInsightsArticles, useUpdateEnlightenInsightsArticle } from './hooks/useEnlightenInsightsArticles';
import { EnlightenInsightsArticle } from '@/db/schema';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '../../explore/about-us/hooks/useImageUpload';
import dynamic from 'next/dynamic';
import Loading from '@/components/layouts/loading';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useQuery } from '@tanstack/react-query';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface EditEnlightenInsightsArticleProps {
    articleId: number;
}

const EditEnlightenInsightsArticle: React.FC<EditEnlightenInsightsArticleProps> = ({ articleId }) => {
    const router = useRouter();
    const { data: articles, isLoading } = useEnlightenInsightsArticles();
    const { mutate: updateArticle, isPending } = useUpdateEnlightenInsightsArticle();
    const { uploadImage, isUploading } = useImageUpload();

    const [formData, setFormData] = useState<EnlightenInsightsArticle | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImages, setFeaturedImages] = useState<ImageListType>([]);

    // Media picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);

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

    // Open media picker for featured image
    const openMediaPicker = () => {
        setShowMediaPicker(true);
    };

    // Handle media selection
    const handleMediaSelect = (url: string, file?: any) => {
        if (!formData) return;
        setFormData({
            ...formData,
            featuredImg: {
                src: url,
                alt: file?.alt || formData.featuredImg?.alt || ''
            }
        });
        setFeaturedImages([{ dataURL: url }]);
        setShowMediaPicker(false);
    };

    // Find the article to edit
    useEffect(() => {
        if (articles && articleId) {
            const article = articles.find(a => a.id === articleId);
            if (article) {
                setFormData({
                    ...article,
                    content: typeof article.content === 'string' ? article.content : JSON.stringify(article.content)
                });
                
                // Set existing image if available
                if (article.featuredImg?.src) {
                    setFeaturedImages([{
                        dataURL: article.featuredImg.src,
                        file: undefined
                    }]);
                }
            }
        }
    }, [articles, articleId]);

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
                const result = await uploadImage(imageList[0].file, 'enlighten/articles');
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
                featuredImg: { src: '', alt: '' }
            }) : null);
        }
    };

    const validateForm = () => {
        if (!formData) return false;
        
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData || !validateForm()) {
            return;
        }

        // Auto-generate slug if not provided
        const slug = formData.slug || formData.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        const articleData = {
            ...formData,
            slug,
            content: typeof formData.content === 'string' ? formData.content : JSON.stringify(formData.content),
        };

        updateArticle(articleData, {
            onSuccess: () => {
                router.push('/enlighten/insights-articles');
            },
            onError: (error) => {
                console.error('Error updating article:', error);
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
                        onClick={() => router.push('/enlighten/insights-articles')}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white-light/40 hover:bg-white-light/60 dark:bg-dark/40 dark:hover:bg-dark/60 transition-colors"
                        title="Back to Articles"
                    >
                        <IconArrowBackward className="w-5 h-5" />
                    </button>
                    <h5 className="text-lg font-semibold dark:text-white-light">Edit Insights Article</h5>
                </div>
                <div className="text-center py-10">
                    <p className="text-red-500">Article not found</p>
                    <button 
                        onClick={() => router.push('/enlighten/insights-articles')} 
                        className="btn btn-primary mt-4"
                    >
                        Back to Articles
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
                    onClick={() => router.push('/enlighten/insights-articles')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white-light/40 hover:bg-white-light/60 dark:bg-dark/40 dark:hover:bg-dark/60 transition-colors"
                    title="Back to Articles"
                >
                    <IconArrowBackward className="w-5 h-5" />
                </button>
                <h5 className="text-lg font-semibold dark:text-white-light">Edit Insights Article</h5>
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
                        placeholder="Enter article title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        className={`form-textarea ${errors.description ? 'border-red-500' : ''}`}
                        rows={3}
                        placeholder="Enter article description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Slug */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium mb-2">
                        Slug (auto-generated if empty)
                    </label>
                    <input
                        id="slug"
                        type="text"
                        className="form-input"
                        placeholder="article-slug (optional)"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                    />
                </div>

                {/* Featured Image */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Featured Image
                        </label>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={openMediaPicker}
                                className="btn btn-outline-primary btn-sm w-full"
                            >
                                Browse Media Library
                            </button>
                            <div className="text-center text-sm text-gray-500">or</div>
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
                                                        {isUploading ? 'Uploading...' : 'Click or drag image here'}
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
                        </div>
                    </div>
                    
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
                </div>

                {/* CTA Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="ctaText" className="block text-sm font-medium mb-2">
                            CTA Button Text
                        </label>
                        <input
                            id="ctaText"
                            type="text"
                            className="form-input"
                            placeholder="Read More"
                            value={formData.cta?.text || ''}
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
                                value={formData.cta?.href || ''}
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
                                id="ctaHref"
                                type="url"
                                className="form-input"
                                placeholder="https://example.com or /path"
                                value={formData.cta?.href || ''}
                                onChange={(e) => handleNestedInputChange('cta', 'href', e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Content *
                    </label>
                    <div className={`${errors.content ? 'border border-red-500 rounded' : ''}`}>
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={(value) => handleInputChange('content', value)}
                            placeholder="Write your article content here..."
                            style={{ minHeight: '200px' }}
                        />
                    </div>
                    {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                </div>

                {/* Quote */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="quoteText" className="block text-sm font-medium mb-2">
                            Quote Text
                        </label>
                        <textarea
                            id="quoteText"
                            className="form-textarea"
                            rows={3}
                            placeholder="Enter quote text"
                            value={formData.quote?.text || ''}
                            onChange={(e) => handleNestedInputChange('quote', 'text', e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="quoteHighlighted" className="block text-sm font-medium mb-2">
                            Quote Highlighted Text
                        </label>
                        <textarea
                            id="quoteHighlighted"
                            className="form-textarea"
                            rows={3}
                            placeholder="Enter highlighted portion of quote"
                            value={formData.quote?.highlighted || ''}
                            onChange={(e) => handleNestedInputChange('quote', 'highlighted', e.target.value)}
                        />
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => router.push('/enlighten/insights-articles')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isPending || isUploading}
                    >
                        {isPending ? 'Updating...' : isUploading ? 'Uploading Image...' : 'Update Article'}
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
                />
            )}
        </div>
    );
};

export default EditEnlightenInsightsArticle;