'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { useImageUpload } from '../../explore/about-us/hooks/useImageUpload';
import { useUpdateVisionMission } from './hooks/useUpdateVisionMission';
import { type EvolutionVisionMission } from '@/db/schema';
import MediaPicker from '@/components/apps/media/MediaPicker';

async function fetchVisionMission(): Promise<EvolutionVisionMission | null> {
    try {
        const response = await fetch('/api/evolution/vision-mission');
        
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching vision mission:', error);
        throw error;
    }
}

export default function VisionMissionBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{
        sectionIndex: number;
        blockIndex: number;
    } | null>(null);

    const { data: visionMission, isLoading, error } = useQuery({
        queryKey: ['evolution-vision-mission'],
        queryFn: fetchVisionMission,
    });

    const updateMutation = useUpdateVisionMission();

    useEffect(() => {
        if (visionMission) {
            setEditData({
                sections: visionMission.sections
            });
        }
    }, [visionMission]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (visionMission) {
            setEditData({
                sections: visionMission.sections
            });
        }
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            await updateMutation.mutateAsync({
                id: visionMission?.id,
                sections: editData.sections,
            });

            setIsEditing(false);
            
            Swal.fire({
                title: 'Success!',
                text: 'Vision mission updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating vision mission:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update vision mission',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleIconImageUpload = async (sectionIndex: number, blockIndex: number, imageList: ImageListType) => {
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/vision-mission/icons');
                
                const newSections = [...editData.sections];
                const newBlocks = [...newSections[sectionIndex].blocks];
                newBlocks[blockIndex] = { 
                    ...newBlocks[blockIndex], 
                    icon: { ...newBlocks[blockIndex].icon, src: result.url }
                };
                newSections[sectionIndex] = { ...newSections[sectionIndex], blocks: newBlocks };
                setEditData({ ...editData, sections: newSections });

                Swal.fire({
                    title: 'Success!',
                    text: 'Icon uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload icon',
                    icon: 'error',
                });
            }
        }
    };

    // Open media picker for icon selection
    const openMediaPicker = (sectionIndex: number, blockIndex: number) => {
        setMediaPickerTarget({ sectionIndex, blockIndex });
        setShowMediaPicker(true);
    };

    // Handle media selection from picker
    const handleMediaSelect = (url: string, file?: any) => {
        if (!mediaPickerTarget) return;

        const { sectionIndex, blockIndex } = mediaPickerTarget;
        const newSections = [...editData.sections];
        const newBlocks = [...newSections[sectionIndex].blocks];
        newBlocks[blockIndex] = { 
            ...newBlocks[blockIndex], 
            icon: { ...newBlocks[blockIndex].icon, src: url }
        };
        newSections[sectionIndex] = { ...newSections[sectionIndex], blocks: newBlocks };
        setEditData({ ...editData, sections: newSections });

        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    const addNewBlock = (sectionIndex: number) => {
        const newBlock = {
            title: 'New Block',
            icon: { src: '/icons/placeholder.svg', alt: 'Icon' },
            content: {
                description: 'Block description',
                quote: 'Block quote'
            }
        };

        const newSections = [...editData.sections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            blocks: [...newSections[sectionIndex].blocks, newBlock]
        };
        setEditData({ ...editData, sections: newSections });
    };

    const removeBlock = (sectionIndex: number, blockIndex: number) => {
        const newSections = [...editData.sections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            blocks: newSections[sectionIndex].blocks.filter((_: any, i: number) => i !== blockIndex)
        };
        setEditData({ ...editData, sections: newSections });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading vision mission</div>
            </div>
        );
    }

    if (!visionMission && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No vision mission found</div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                sections: [{
                                    id: 'future-envisioned',
                                    title: 'FUTURE: ENVISIONED',
                                    blocks: [],
                                    footer: { text: '' }
                                }]
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Vision Mission
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        type="button" 
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleBack}
                    >
                        <IconArrowBackward className="h-4 w-4 mr-1" />
                        Back
                    </button>
                    <h5 className="text-lg font-semibold dark:text-white-light">
                        Vision & Mission Management
                    </h5>
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            onClick={handleEdit}
                        >
                            <IconEdit className="h-4 w-4 mr-1" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                className="btn btn-success btn-sm"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                            >
                                <IconCheck className="h-4 w-4 mr-1" />
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleCancel}
                            >
                                <IconX className="h-4 w-4 mr-1" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {(isEditing ? editData?.sections : visionMission?.sections)?.map((section: any, sectionIndex: number) => (
                    <div key={section.id} className="panel">
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h6 className="text-lg font-semibold">
                                    {section.id}
                                    <span className="ml-2 badge bg-primary text-xs">
                                        {section.blocks?.length || 0} blocks
                                    </span>
                                </h6>
                            </div>

                            {/* Section Header */}
                            <div className="mb-4">
                                <div>
                                    <label className="form-label">Section Title</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={section.title}
                                            onChange={(e) => {
                                                const newSections = [...editData.sections];
                                                newSections[sectionIndex] = { ...section, title: e.target.value };
                                                setEditData({ ...editData, sections: newSections });
                                            }}
                                            placeholder="Section title"
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{section.title}</div>
                                    )}
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Blocks Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-semibold">Vision & Mission Blocks</h6>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => addNewBlock(sectionIndex)}
                                        >
                                            <IconPlus className="h-4 w-4 mr-1" />
                                            Add Block
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {section.blocks?.map((block: any, blockIndex: number) => (
                                        <div key={blockIndex} className="panel border">
                                            <div className="flex items-center justify-between mb-3">
                                                <h6 className="font-medium">{block.title}</h6>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeBlock(sectionIndex, blockIndex)}
                                                    >
                                                        <IconTrash className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="form-label text-sm">Block Title</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={block.title}
                                                            onChange={(e) => {
                                                                const newSections = [...editData.sections];
                                                                const newBlocks = [...section.blocks];
                                                                newBlocks[blockIndex] = { ...block, title: e.target.value };
                                                                newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                setEditData({ ...editData, sections: newSections });
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="form-label text-sm">Icon Upload</label>
                                                        <div className="space-y-2">
                                                            {block.icon.src && (
                                                                <div className="flex items-center gap-2 p-2 border rounded">
                                                                    <img 
                                                                        src={block.icon.src} 
                                                                        alt={block.icon.alt}
                                                                        className="w-8 h-8 object-cover rounded"
                                                                    />
                                                                    <span className="text-xs text-gray-600 flex-1 truncate">
                                                                        {block.icon.src}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newSections = [...editData.sections];
                                                                            const newBlocks = [...section.blocks];
                                                                            newBlocks[blockIndex] = { 
                                                                                ...block, 
                                                                                icon: { ...block.icon, src: '' }
                                                                            };
                                                                            newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                            setEditData({ ...editData, sections: newSections });
                                                                        }}
                                                                        className="btn btn-danger btn-xs"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => openMediaPicker(sectionIndex, blockIndex)}
                                                                className="btn btn-outline-primary btn-sm w-full"
                                                            >
                                                                Browse Media
                                                            </button>
                                                            <ImageUploading 
                                                                value={[]} 
                                                                onChange={(imageList) => handleIconImageUpload(sectionIndex, blockIndex, imageList)}
                                                                maxNumber={1}
                                                                dataURLKey="dataURL"
                                                            >
                                                                {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                                    <button
                                                                        type="button"
                                                                        className={`btn btn-outline-primary btn-sm w-full ${isDragging ? 'bg-blue-100' : ''}`}
                                                                        onClick={onImageUpload}
                                                                        {...dragProps}
                                                                        disabled={isUploading}
                                                                    >
                                                                        {isUploading ? 'Uploading...' : 'Upload Icon'}
                                                                    </button>
                                                                )}
                                                            </ImageUploading>
                                                            
                                                            <div>
                                                                <label className="form-label text-sm">Or enter URL manually</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={block.icon.src}
                                                                    onChange={(e) => {
                                                                        const newSections = [...editData.sections];
                                                                        const newBlocks = [...section.blocks];
                                                                        newBlocks[blockIndex] = { 
                                                                            ...block, 
                                                                            icon: { ...block.icon, src: e.target.value }
                                                                        };
                                                                        newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                        setEditData({ ...editData, sections: newSections });
                                                                    }}
                                                                    placeholder="Icon URL"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="form-label text-sm">Description</label>
                                                        <textarea
                                                            className="form-textarea"
                                                            rows={3}
                                                            value={block.content.description}
                                                            onChange={(e) => {
                                                                const newSections = [...editData.sections];
                                                                const newBlocks = [...section.blocks];
                                                                newBlocks[blockIndex] = { 
                                                                    ...block, 
                                                                    content: { ...block.content, description: e.target.value }
                                                                };
                                                                newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                setEditData({ ...editData, sections: newSections });
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="form-label text-sm">Quote</label>
                                                        <textarea
                                                            className="form-textarea"
                                                            rows={2}
                                                            value={block.content.quote}
                                                            onChange={(e) => {
                                                                const newSections = [...editData.sections];
                                                                const newBlocks = [...section.blocks];
                                                                newBlocks[blockIndex] = { 
                                                                    ...block, 
                                                                    content: { ...block.content, quote: e.target.value }
                                                                };
                                                                newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                setEditData({ ...editData, sections: newSections });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <img 
                                                            src={block.icon.src} 
                                                            alt={block.icon.alt}
                                                            className="w-8 h-8 object-cover rounded"
                                                        />
                                                        <span className="font-medium">{block.title}</span>
                                                    </div>
                                                    <p className="text-sm">{block.content.description}</p>
                                                    <blockquote className="text-sm italic text-gray-600 border-l-4 border-blue-500 pl-3">
                                                        "{block.content.quote}"
                                                    </blockquote>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Footer Section */}
                            <div>
                                <h6 className="font-semibold mb-3">Section Footer</h6>
                                <div>
                                    <label className="form-label">Footer Text</label>
                                    {isEditing ? (
                                        <textarea
                                            className="form-textarea"
                                            rows={2}
                                            value={section.footer.text}
                                            onChange={(e) => {
                                                const newSections = [...editData.sections];
                                                newSections[sectionIndex] = {
                                                    ...section,
                                                    footer: { ...section.footer, text: e.target.value }
                                                };
                                                setEditData({ ...editData, sections: newSections });
                                            }}
                                            placeholder="Footer text"
                                        />
                                    ) : (
                                        <div className="form-textarea bg-gray-100 min-h-[60px] p-3">
                                            {section.footer.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setMediaPickerTarget(null);
                    }}
                    onSelect={handleMediaSelect}
                    allowedTypes={['image']}
                    title="Select Icon Image"
                    allowUrlInput={false}
                />
            )}
        </div>
    );
}