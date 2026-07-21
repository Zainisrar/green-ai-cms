'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exploreAboutUsApi, exploreAboutUsKeys } from '@/lib/api/exploreAboutUs';
import { useUpdateExploreAboutUsByKey } from './hooks/useUpdateExploreAboutUs';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from './hooks/useImageUpload';
import MediaPicker from '@/components/apps/media/MediaPicker';
import 'react-quill/dist/quill.snow.css';


// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill');
        // Import CSS
        return RQ;
    },
    {
        ssr: false,
        loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded"></div>,
    },
);

interface ExploreAboutUsBaseProps {
    contentKey?: string;
}

export default function ExploreAboutUsBase({ contentKey = 'main-about' }: ExploreAboutUsBaseProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [images, setImages] = useState<ImageListType>([]);
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const {
        data: aboutUs,
        isLoading,
        error,
    } = useQuery({
        queryKey: exploreAboutUsKeys.detailByKey(contentKey),
        queryFn: async () => {
            try {
                return await exploreAboutUsApi.getByKey(contentKey);
            } catch (error) {
                // If specific key not found, try to get the first available entry
                console.log(`Key "${contentKey}" not found, trying to get first available entry`);
                const allEntries = await exploreAboutUsApi.getAll();
                if (allEntries.length > 0) {
                    return allEntries[0];
                }
                throw error;
            }
        },
    });

    const updateMutation = useUpdateExploreAboutUsByKey();
    const [quillLoaded, setQuillLoaded] = useState(false);

    // Ensure Quill is properly loaded
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuillLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [isEditing]);

    useEffect(() => {
        if (aboutUs) {
            // Handle the content - it's already HTML string, no need to parse
            const contentHtml = typeof aboutUs.content === 'string' ? aboutUs.content : (aboutUs.content as any)?.html || '';

            const quoteHtml = typeof aboutUs.quote === 'string' ? aboutUs.quote : (aboutUs.quote as any)?.html || '';

            setEditData({
                title: aboutUs.title,
                key: aboutUs.key,
                content: contentHtml,
                quote: quoteHtml,
                bgImg: aboutUs.bgImg,
            });
        }
    }, [aboutUs]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (aboutUs) {
            const contentHtml = typeof aboutUs.content === 'string' ? aboutUs.content : (aboutUs.content as any)?.html || '';

            const quoteHtml = typeof aboutUs.quote === 'string' ? aboutUs.quote : (aboutUs.quote as any)?.html || '';

            setEditData({
                title: aboutUs.title,
                key: aboutUs.key,
                content: contentHtml,
                quote: quoteHtml,
                bgImg: aboutUs.bgImg,
            });
        }
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                key: contentKey,
                data: {
                    title: editData.title,
                    key: editData.key,
                    content: editData.content,
                    quote: editData.quote,
                    bgImg: editData.bgImg,
                },
            });

            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'About us content updated successfully',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update about us content',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    // Handle image upload in ReactQuill
    const handleQuillImageUpload = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                try {
                    const result = await uploadImage(file, 'explore/about-us/content');

                    // Insert image into quill editor
                    const quillEditor = document.querySelector('.ql-editor');
                    if (quillEditor) {
                        const img = document.createElement('img');
                        img.src = result.url;
                        img.style.maxWidth = '100%';
                        quillEditor.appendChild(img);

                        // Update the content state
                        const updatedContent = editData.content + `<img src="${result.url}" style="max-width: 100%;" />`;
                        setEditData({ ...editData, content: updatedContent });
                    }
                } catch (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to upload image',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        };
    };

    // ReactQuill modules configuration
    const quillModules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ script: 'sub' }, { script: 'super' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ size: ['small', false, 'large', 'huge'] }],
                [{ color: [] }, { background: [] }],
                [{ font: [] }],
                [{ align: [] }],
                ['link', 'image'],
                ['clean'],
            ],
        },
    };

    const quillFormats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'video',
        'color',
        'background',
        'align',
        'script',
    ];

    // Handle image upload to Cloudinary
    const handleImageChange = async (imageList: ImageListType) => {
        setImages(imageList);

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'explore/about-us');
                setEditData({ ...editData, bgImg: result.url });

                Swal.fire({
                    title: 'Success!',
                    text: 'Image uploaded to Cloudinary successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload image to Cloudinary',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                // Remove the failed image from the list
                setImages([]);
            }
        }
    };

    // Handle image URL input
    const handleImageUrlChange = (url: string) => {
        setEditData({ ...editData, bgImg: url });
        // Clear uploaded images if URL is provided
        if (url) {
            setImages([]);
        }
    };

    // Handle media picker selection
    const handleMediaSelect = (url: string, file?: any) => {
        setEditData({ ...editData, bgImg: url });
        setImages([]);
        setShowMediaPicker(false);
    };

    if (isLoading) return <Loading />;
    if (error) {
        console.error('About us loading error:', error);
        return (
            <div className="panel">
                <div className="text-red-500 p-4">
                    <h3 className="font-semibold mb-2">Error loading about us content</h3>
                    <p className="text-sm">Looking for key: "{contentKey}"</p>
                    <p className="text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
            </div>
        );
    }
    if (!aboutUs || !editData) {
        return (
            <div className="panel">
                <div className="text-gray-500 p-4">
                    <h3 className="font-semibold mb-2">No about us content found</h3>
                    <p className="text-sm">Looking for key: "{contentKey}"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.back()} className="btn btn-outline-primary btn-sm">
                        <IconArrowBackward className="w-4 h-4" />
                        Back
                    </button>
                    <h5 className="font-semibold text-lg">About Us Management</h5>
                </div>

                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <button onClick={handleEdit} className="btn btn-primary btn-sm">
                            <IconEdit className="w-4 h-4" />
                            Edit
                        </button>
                    ) : (
                        <>
                            <button onClick={handleSave} className="btn btn-success btn-sm" disabled={updateMutation.isPending || isUploading}>
                                <IconCheck className="w-4 h-4" />
                                {isUploading ? 'Uploading...' : 'Save'}
                            </button>
                            <button onClick={handleCancel} className="btn btn-danger btn-sm">
                                <IconX className="w-4 h-4" />
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Background Image Preview */}
            {aboutUs.bgImg && (
                <div className="mb-6">
                    <div className="h-48 bg-cover bg-center rounded-lg border" style={{ backgroundImage: `url(${aboutUs.bgImg})` }} />
                </div>
            )}

            <div className="space-y-6">
                {/* Basic Information */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            {isEditing ? (
                                <input type="text" className="form-input" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                            ) : (
                                <p className="text-lg font-bold">{aboutUs.title}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Key</label>
                            {isEditing ? (
                                <input type="text" className="form-input" value={editData.key} onChange={(e) => setEditData({ ...editData, key: e.target.value })} />
                            ) : (
                                <p className="text-gray-600">{aboutUs.key}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Background Image</label>
                            {isEditing ? (
                                <div className="space-y-4">
                                    {/* Current Image Preview */}
                                    {editData.bgImg && (
                                        <div className="relative">
                                            <img
                                                src={editData.bgImg}
                                                alt="Background preview"
                                                className="w-full h-48 object-cover rounded-lg border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditData({ ...editData, bgImg: '' })}
                                                className="absolute top-2 right-2 btn btn-sm btn-danger"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}

                                    {/* Browse Media Library Button */}
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setShowMediaPicker(true)}
                                            className="btn btn-outline-primary w-full"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Browse Media Library
                                        </button>
                                    </div>

                                    {/* OR Divider */}
                                    <div className="flex items-center">
                                        <div className="flex-1 border-t border-gray-300"></div>
                                        <span className="px-3 text-sm text-gray-500">OR</span>
                                        <div className="flex-1 border-t border-gray-300"></div>
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Upload New Image to Cloudinary</label>
                                        <ImageUploading value={images} onChange={handleImageChange} maxNumber={1} dataURLKey="dataURL">
                                            {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                <div className="space-y-2">
                                                    {imageList.length === 0 ? (
                                                        <button
                                                            type="button"
                                                            className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                                                                isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                                                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={onImageUpload}
                                                            disabled={isUploading}
                                                            {...dragProps}
                                                        >
                                                            {isUploading ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                                                    <span className="text-sm text-gray-500">Uploading to Cloudinary...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                                        />
                                                                    </svg>
                                                                    <span className="text-sm text-gray-500">Click or drag image here</span>
                                                                    <span className="text-xs text-gray-400 mt-1">Will upload to Cloudinary</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="relative">
                                                            <img src={imageList[0].dataURL} alt="Background" className="w-full h-32 object-cover rounded-lg" />
                                                            <div className="absolute top-2 right-2 flex gap-2">
                                                                <button type="button" onClick={() => onImageUpdate(0)} className="btn btn-sm btn-primary" disabled={isUploading}>
                                                                    Update
                                                                </button>
                                                                <button type="button" onClick={() => onImageRemove(0)} className="btn btn-sm btn-danger" disabled={isUploading}>
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </ImageUploading>
                                    </div>

                                    {/* OR Divider */}
                                    <div className="flex items-center">
                                        <div className="flex-1 border-t border-gray-300"></div>
                                        <span className="px-3 text-sm text-gray-500">OR</span>
                                        <div className="flex-1 border-t border-gray-300"></div>
                                    </div>

                                    {/* Image URL Input */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Image URL</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={images.length > 0 ? '' : editData.bgImg}
                                            onChange={(e) => handleImageUrlChange(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            disabled={images.length > 0 || isUploading}
                                        />
                                        {images.length > 0 && <p className="text-xs text-gray-500 mt-1">Remove uploaded image to use URL instead</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-gray-600 break-all">{aboutUs.bgImg}</p>
                                    {aboutUs.bgImg && <img src={aboutUs.bgImg} alt="Background preview" className="w-32 h-20 object-cover rounded border" />}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Main Content</h6>
                    {isEditing ? (
                        <div className="mb-4">
                            {quillLoaded && (
                                <ReactQuill
                                    key={`content-editor-${aboutUs?.id}`}
                                    theme="snow"
                                    value={editData.content || ''}
                                    onChange={(content: any) => setEditData({ ...editData, content })}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    style={{ minHeight: '300px' }}
                                    placeholder="Enter your content here..."
                                />
                            )}
                        </div>
                    ) : (
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: typeof aboutUs.content === 'string' ? aboutUs.content : (aboutUs.content as any)?.html || '',
                            }}
                        />
                    )}
                </div>

                {/* Quote Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Quote Section</h6>
                    {isEditing ? (
                        <div className="mb-4">
                            {quillLoaded && (
                                <ReactQuill
                                    key={`quote-editor-${aboutUs?.id}`}
                                    theme="snow"
                                    value={editData.quote || ''}
                                    onChange={(quote: any) => setEditData({ ...editData, quote })}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    style={{ minHeight: '150px' }}
                                    placeholder="Enter quote content..."
                                />
                            )}
                        </div>
                    ) : (
                        <div
                            className="prose max-w-none bg-gray-50 p-4 rounded-lg border-l-4 border-primary"
                            dangerouslySetInnerHTML={{
                                __html: typeof aboutUs.quote === 'string' ? aboutUs.quote : (aboutUs.quote as any)?.html || '',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={handleMediaSelect}
                    allowedTypes={['image']}
                    title="Select Background Image"
                    allowUrlInput={false}
                />
            )}
        </div>
    );
}
