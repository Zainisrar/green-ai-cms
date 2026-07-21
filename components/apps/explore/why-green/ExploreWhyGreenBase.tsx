'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exploreWhyGreenApi, exploreWhyGreenKeys } from '@/lib/api/exploreWhyGreen';
import { useUpdateExploreWhyGreenById } from './hooks/useUpdateExploreWhyGreen';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '../about-us/hooks/useImageUpload';
import MediaPicker from '@/components/apps/media/MediaPicker';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';

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

interface ExploreWhyGreenBaseProps {
    entryId?: string;
}

export default function ExploreWhyGreenBase({ entryId = '1' }: ExploreWhyGreenBaseProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const [quillLoaded, setQuillLoaded] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentIconIndex, setCurrentIconIndex] = useState<number | null>(null);

    const {
        data: whyGreen,
        isLoading,
        error,
    } = useQuery({
        queryKey: exploreWhyGreenKeys.detail(entryId),
        queryFn: async () => {
            try {
                return await exploreWhyGreenApi.getById(entryId);
            } catch (error) {
                // If specific ID not found, try to get the first available entry
                console.log(`ID "${entryId}" not found, trying to get first available entry`);
                const allEntries = await exploreWhyGreenApi.getAll();
                if (allEntries.length > 0) {
                    return allEntries[0];
                }
                throw error;
            }
        },
    });

    const updateMutation = useUpdateExploreWhyGreenById();

    // Ensure Quill is properly loaded
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuillLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [isEditing]);

    useEffect(() => {
        if (whyGreen) {
            // Handle the content - it's already HTML string, no need to parse
            const contentHtml = typeof whyGreen.content === 'string' 
                ? whyGreen.content 
                : (whyGreen.content as any)?.html || '';

            setEditData({
                key: whyGreen.key,
                content: contentHtml,
                icons: whyGreen.icons || [],
            });
        }
    }, [whyGreen]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (whyGreen) {
            const contentHtml = typeof whyGreen.content === 'string' 
                ? whyGreen.content 
                : (whyGreen.content as any)?.html || '';

            setEditData({
                key: whyGreen.key,
                content: contentHtml,
                icons: whyGreen.icons || [],
            });
        }
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                id: entryId,
                data: {
                    key: editData.key,
                    content: editData.content,
                    icons: editData.icons,
                },
            });

            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'Why Green content updated successfully',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update Why Green content',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
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

    // Handle icon image upload
    const handleIconImageUpload = async (iconIndex: number, imageList: ImageListType) => {
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'explore/why-green/icons');
                
                const updatedIcons = [...editData.icons];
                updatedIcons[iconIndex] = {
                    ...updatedIcons[iconIndex],
                    img: {
                        ...updatedIcons[iconIndex].img,
                        src: result.url,
                    }
                };
                
                setEditData({ ...editData, icons: updatedIcons });
                
                Swal.fire({
                    title: 'Success!',
                    text: 'Icon image uploaded to Cloudinary successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload icon image to Cloudinary',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    // Add new icon
    const addIcon = () => {
        const newIcon = {
            text: '',
            img: { src: '', alt: '' },
            description: ''
        };
        setEditData({ ...editData, icons: [...editData.icons, newIcon] });
    };

    // Remove icon
    const removeIcon = (index: number) => {
        const updatedIcons = editData.icons.filter((_: any, i: number) => i !== index);
        setEditData({ ...editData, icons: updatedIcons });
    };

    // Handle media picker selection for icons
    const handleMediaSelect = (url: string, file?: any) => {
        if (currentIconIndex !== null) {
            const updatedIcons = [...editData.icons];
            updatedIcons[currentIconIndex] = {
                ...updatedIcons[currentIconIndex],
                img: {
                    ...updatedIcons[currentIconIndex].img,
                    src: url,
                }
            };
            setEditData({ ...editData, icons: updatedIcons });
        }
        setShowMediaPicker(false);
        setCurrentIconIndex(null);
    };

    // Open media picker for specific icon
    const openMediaPickerForIcon = (index: number) => {
        setCurrentIconIndex(index);
        setShowMediaPicker(true);
    };

    // Update icon field
    const updateIconField = (index: number, field: string, value: any) => {
        const updatedIcons = [...editData.icons];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updatedIcons[index] = {
                ...updatedIcons[index],
                [parent]: {
                    ...updatedIcons[index][parent],
                    [child]: value
                }
            };
        } else {
            updatedIcons[index] = { ...updatedIcons[index], [field]: value };
        }
        setEditData({ ...editData, icons: updatedIcons });
    };

    if (isLoading) return <Loading />;
    if (error) {
        console.error('Why Green loading error:', error);
        return (
            <div className="panel">
                <div className="text-red-500 p-4">
                    <h3 className="font-semibold mb-2">Error loading Why Green content</h3>
                    <p className="text-sm">Looking for ID: "{entryId}"</p>
                    <p className="text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
            </div>
        );
    }
    if (!whyGreen || !editData) {
        return (
            <div className="panel">
                <div className="text-gray-500 p-4">
                    <h3 className="font-semibold mb-2">No Why Green content found</h3>
                    <p className="text-sm">Looking for ID: "{entryId}"</p>
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
                    <h5 className="font-semibold text-lg">Why Green Management</h5>
                </div>

                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <button onClick={handleEdit} className="btn btn-primary btn-sm">
                            <IconEdit className="w-4 h-4" />
                            Edit
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleSave} 
                                className="btn btn-success btn-sm" 
                                disabled={updateMutation.isPending || isUploading}
                            >
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

            <div className="space-y-6">
                {/* Key Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Key Information</h6>
                    <div>
                        <label className="block text-sm font-medium mb-2">Key Text</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                className="form-input" 
                                value={editData.key?.text || ''} 
                                onChange={(e) => setEditData({ 
                                    ...editData, 
                                    key: { ...editData.key, text: e.target.value } 
                                })} 
                                placeholder="Enter key text..."
                            />
                        ) : (
                            <p className="text-lg font-bold">{whyGreen.key?.text}</p>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Main Content</h6>
                    {isEditing ? (
                        <div className="mb-4">
                            {quillLoaded && (
                                <ReactQuill
                                    key={`content-editor-${whyGreen?.id}`}
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
                                __html: typeof whyGreen.content === 'string' 
                                    ? whyGreen.content 
                                    : (whyGreen.content as any)?.html || '',
                            }}
                        />
                    )}
                </div>

                {/* Icons Section */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Icons</h6>
                        {isEditing && (
                            <button 
                                onClick={addIcon}
                                className="btn btn-primary btn-sm"
                            >
                                <IconPlus className="w-4 h-4" />
                                Add Icon
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(isEditing ? editData.icons : whyGreen.icons)?.map((icon: any, index: number) => (
                            <div key={index} className="panel border">
                                {isEditing && (
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={() => removeIcon(index)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                
                                {/* Icon Image */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Icon Image</label>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            {/* Current Image Preview */}
                                            {icon.img?.src && (
                                                <div className="relative inline-block">
                                                    <img 
                                                        src={icon.img.src} 
                                                        alt={icon.img.alt || 'Icon'} 
                                                        className="w-20 h-20 object-cover rounded border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateIconField(index, 'img.src', '')}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}

                                            {/* Browse Media Library Button */}
                                            <button
                                                type="button"
                                                onClick={() => openMediaPickerForIcon(index)}
                                                className="btn btn-outline-primary btn-sm w-full"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Browse Media
                                            </button>

                                            {/* OR Divider */}
                                            <div className="flex items-center">
                                                <div className="flex-1 border-t border-gray-300"></div>
                                                <span className="px-2 text-xs text-gray-500">OR</span>
                                                <div className="flex-1 border-t border-gray-300"></div>
                                            </div>

                                            {/* Upload Button */}
                                            <ImageUploading 
                                                value={[]} 
                                                onChange={(imageList) => handleIconImageUpload(index, imageList)}
                                                maxNumber={1} 
                                                dataURLKey="dataURL"
                                            >
                                                {({ onImageUpload, isDragging, dragProps }) => (
                                                    <button
                                                        type="button"
                                                        className={`w-full h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                                                            isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                                                        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={onImageUpload}
                                                        disabled={isUploading}
                                                        {...dragProps}
                                                    >
                                                        {isUploading ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mb-1"></div>
                                                                <span className="text-xs text-gray-500">Uploading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <IconPlus className="w-5 h-5 text-gray-400 mb-1" />
                                                                <span className="text-xs text-gray-500">Upload New</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </ImageUploading>
                                            
                                            {/* URL Input */}
                                            <input
                                                type="text"
                                                className="form-input text-sm"
                                                value={icon.img?.src || ''}
                                                onChange={(e) => updateIconField(index, 'img.src', e.target.value)}
                                                placeholder="Or enter image URL..."
                                            />
                                            
                                            {/* Alt Text */}
                                            <input
                                                type="text"
                                                className="form-input text-sm"
                                                value={icon.img?.alt || ''}
                                                onChange={(e) => updateIconField(index, 'img.alt', e.target.value)}
                                                placeholder="Alt text..."
                                            />
                                        </div>
                                    ) : (
                                        icon.img?.src && (
                                            <img 
                                                src={icon.img.src} 
                                                alt={icon.img.alt} 
                                                className="w-16 h-16 object-cover rounded border"
                                            />
                                        )
                                    )}
                                </div>

                                {/* Icon Text */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Text</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={icon.text || ''}
                                            onChange={(e) => updateIconField(index, 'text', e.target.value)}
                                            placeholder="Icon text..."
                                        />
                                    ) : (
                                        <p className="font-semibold">{icon.text}</p>
                                    )}
                                </div>

                                {/* Icon Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    {isEditing ? (
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            value={icon.description || ''}
                                            onChange={(e) => updateIconField(index, 'description', e.target.value)}
                                            placeholder="Icon description..."
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-600">{icon.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setCurrentIconIndex(null);
                    }}
                    onSelect={handleMediaSelect}
                    allowedTypes={['image']}
                    title="Select Icon Image"
                    allowUrlInput={false}
                />
            )}
            </div>
        </div>
    );
}