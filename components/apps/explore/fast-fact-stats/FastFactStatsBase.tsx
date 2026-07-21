'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '../about-us/hooks/useImageUpload';
import { useUpdateFastFactStats } from './hooks/useUpdateFastFactStats';
import { type ExploreFastFactStats, type FastFactStatsSection, type FastFactSection, type ImpactSummarySection } from '@/db/schema';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchFastFactStats(): Promise<ExploreFastFactStats | null> {
    const response = await fetch('/api/explore/fast-fact-stats');
    if (!response.ok) {
        throw new Error('Failed to fetch fast fact stats');
    }
    return response.json();
}

export default function FastFactStatsBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{
        sectionIndex: number;
        blockIndex?: number;
    } | null>(null);
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: string]: 'navigation' | 'manual' }>({});

    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    // Flatten navigation items to include all sub-navigation items
    const flattenNavItems = (items: any[]): any[] => {
        if (!items) return [];
        const flattened: any[] = [];
        
        const traverse = (navItems: any[], parentName?: string) => {
            navItems.forEach((item) => {
                const displayName = parentName ? `${parentName} > ${item.name}` : item.name;
                flattened.push({
                    ...item,
                    displayName,
                });
                if (item.children && item.children.length > 0) {
                    traverse(item.children, displayName);
                }
            });
        };
        
        traverse(items);
        return flattened;
    };

    const allNavItems = flattenNavItems(navigationItems || []);

    const {
        data: fastFactStats,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['fast-fact-stats'],
        queryFn: fetchFastFactStats,
    });

    const updateMutation = useUpdateFastFactStats();

    const handleEdit = () => {
        setIsEditing(true);
        if (fastFactStats) {
            setEditData({
                sections: fastFactStats.sections,
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (fastFactStats) {
            setEditData({
                sections: fastFactStats.sections,
            });
        }
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            await updateMutation.mutateAsync({
                id: fastFactStats?.id,
                sections: editData.sections,
            });

            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'Fast fact stats updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating fast fact stats:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update fast fact stats',
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
                const result = await uploadImage(imageList[0].file, 'explore/fast-fact-stats/icons');

                const newSections = [...editData.sections];
                const section = newSections[sectionIndex] as FastFactSection;
                const newBlocks = [...section.blocks];
                newBlocks[blockIndex] = {
                    ...newBlocks[blockIndex],
                    icon: { ...newBlocks[blockIndex].icon, src: result.url },
                };
                newSections[sectionIndex] = { ...section, blocks: newBlocks };
                setEditData({ ...editData, sections: newSections });

                Swal.fire({
                    title: 'Success!',
                    text: 'Icon uploaded to Cloudinary successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload icon to Cloudinary',
                    icon: 'error',
                    confirmButtonText: 'OK',
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
        const section = newSections[sectionIndex] as FastFactSection;
        
        if (blockIndex !== undefined && section.blocks) {
            const newBlocks = [...section.blocks];
            newBlocks[blockIndex] = {
                ...newBlocks[blockIndex],
                icon: { ...newBlocks[blockIndex].icon, src: url },
            };
            newSections[sectionIndex] = { ...section, blocks: newBlocks };
        }

        setEditData({ ...editData, sections: newSections });
        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading fast fact stats</div>
            </div>
        );
    }

    if (!fastFactStats && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No fast fact stats found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({ sections: [] });
                            setIsEditing(true);
                        }}
                    >
                        Create Fast Fact Stats
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleBack}>
                        <IconArrowBackward className="h-4 w-4 mr-1" />
                        Back
                    </button>
                    <h5 className="text-lg font-semibold dark:text-white-light">Fast Facts & Stats Management</h5>
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <button type="button" className="btn btn-primary btn-sm" onClick={handleEdit}>
                            <IconEdit className="h-4 w-4 mr-1" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" className="btn btn-success btn-sm" onClick={handleSave} disabled={updateMutation.isPending}>
                                <IconCheck className="h-4 w-4 mr-1" />
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleCancel}>
                                <IconX className="h-4 w-4 mr-1" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {(isEditing ? editData?.sections : fastFactStats?.sections)?.map((section: any, sectionIndex: number) => (
                    <div key={section.id} className="panel">
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h6 className="text-lg font-semibold">
                                    {section.id}
                                    <span className="ml-2 badge bg-primary text-xs">{'blocks' in section ? 'Fast Facts' : 'Impact Summary'}</span>
                                </h6>
                            </div>

                            {/* Fast Facts Section */}
                            {'blocks' in section && (
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="form-label">Title</label>
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
                                            </div>
                                            <div>
                                                <label className="form-label">Subtitle</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={section.subtitle}
                                                    onChange={(e) => {
                                                        const newSections = [...editData.sections];
                                                        newSections[sectionIndex] = { ...section, subtitle: e.target.value };
                                                        setEditData({ ...editData, sections: newSections });
                                                    }}
                                                    placeholder="Section subtitle"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={3}
                                                    value={section.description}
                                                    onChange={(e) => {
                                                        const newSections = [...editData.sections];
                                                        newSections[sectionIndex] = { ...section, description: e.target.value };
                                                        setEditData({ ...editData, sections: newSections });
                                                    }}
                                                    placeholder="Section description"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                                            <p className="text-gray-600 mb-2">{section.subtitle}</p>
                                            <p className="text-sm">{section.description}</p>
                                        </div>
                                    )}

                                    <hr className="my-4" />

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h6 className="font-semibold">Fact Blocks ({section.blocks?.length || 0})</h6>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => {
                                                        const newBlock = {
                                                            title: 'New Block',
                                                            icon: { src: '/icons/placeholder.svg', alt: 'Icon' },
                                                            content: {
                                                                data: {
                                                                    New_Metric: '0',
                                                                    Another_Metric: 'Value',
                                                                },
                                                                note: 'Description note for this block',
                                                            },
                                                        };
                                                        const newSections = [...editData.sections];
                                                        newSections[sectionIndex] = {
                                                            ...section,
                                                            blocks: [...(section.blocks || []), newBlock],
                                                        };
                                                        setEditData({ ...editData, sections: newSections });
                                                    }}
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
                                                                onClick={() => {
                                                                    const newSections = [...editData.sections];
                                                                    newSections[sectionIndex] = {
                                                                        ...section,
                                                                        blocks: section.blocks.filter((_: any, i: number) => i !== blockIndex),
                                                                    };
                                                                    setEditData({ ...editData, sections: newSections });
                                                                }}
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
                                                                        <div className="flex items-center gap-2 p-2 border rounded mb-2">
                                                                            <img src={block.icon.src} alt={block.icon.alt} className="w-8 h-8 object-cover rounded" />
                                                                            <span className="text-xs text-gray-600 flex-1 truncate">{block.icon.src}</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newSections = [...editData.sections];
                                                                                    const newBlocks = [...section.blocks];
                                                                                    newBlocks[blockIndex] = {
                                                                                        ...block,
                                                                                        icon: { ...block.icon, src: '' },
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
                                                                                    icon: { ...block.icon, src: e.target.value },
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
                                                                <label className="form-label text-sm">Metrics Data</label>
                                                                <div className="space-y-2 p-3 border rounded bg-gray-50">
                                                                    {Object.entries(block.content.data || {}).map(([key, value], metricIndex) => (
                                                                        <div key={metricIndex} className="grid grid-cols-3 gap-2 items-center">
                                                                            <input
                                                                                type="text"
                                                                                className="form-input text-sm"
                                                                                value={key}
                                                                                onChange={(e) => {
                                                                                    const newSections = [...editData.sections];
                                                                                    const newBlocks = [...section.blocks];
                                                                                    const newData = { ...block.content.data };

                                                                                    // Remove old key and add new key
                                                                                    delete newData[key];
                                                                                    newData[e.target.value] = value;

                                                                                    newBlocks[blockIndex] = {
                                                                                        ...block,
                                                                                        content: { ...block.content, data: newData },
                                                                                    };
                                                                                    newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                                    setEditData({ ...editData, sections: newSections });
                                                                                }}
                                                                                placeholder="Metric name"
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                className="form-input text-sm"
                                                                                value={String(value)}
                                                                                onChange={(e) => {
                                                                                    const newSections = [...editData.sections];
                                                                                    const newBlocks = [...section.blocks];
                                                                                    const newData = { ...block.content.data };
                                                                                    newData[key] = e.target.value;

                                                                                    newBlocks[blockIndex] = {
                                                                                        ...block,
                                                                                        content: { ...block.content, data: newData },
                                                                                    };
                                                                                    newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                                    setEditData({ ...editData, sections: newSections });
                                                                                }}
                                                                                placeholder="Metric value"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-outline-danger btn-sm"
                                                                                onClick={() => {
                                                                                    const newSections = [...editData.sections];
                                                                                    const newBlocks = [...section.blocks];
                                                                                    const newData = { ...block.content.data };
                                                                                    delete newData[key];

                                                                                    newBlocks[blockIndex] = {
                                                                                        ...block,
                                                                                        content: { ...block.content, data: newData },
                                                                                    };
                                                                                    newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                                    setEditData({ ...editData, sections: newSections });
                                                                                }}
                                                                            >
                                                                                <IconTrash className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-primary btn-sm w-full mt-2"
                                                                        onClick={() => {
                                                                            const newSections = [...editData.sections];
                                                                            const newBlocks = [...section.blocks];
                                                                            const newData = {
                                                                                ...block.content.data,
                                                                                [`new_metric_${Date.now()}`]: 'New Value',
                                                                            };

                                                                            newBlocks[blockIndex] = {
                                                                                ...block,
                                                                                content: { ...block.content, data: newData },
                                                                            };
                                                                            newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                            setEditData({ ...editData, sections: newSections });
                                                                        }}
                                                                    >
                                                                        <IconPlus className="h-3 w-3 mr-1" />
                                                                        Add Metric
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="form-label text-sm">Note</label>
                                                                <textarea
                                                                    className="form-textarea"
                                                                    rows={2}
                                                                    value={block.content.note}
                                                                    onChange={(e) => {
                                                                        const newSections = [...editData.sections];
                                                                        const newBlocks = [...section.blocks];
                                                                        newBlocks[blockIndex] = {
                                                                            ...block,
                                                                            content: { ...block.content, note: e.target.value },
                                                                        };
                                                                        newSections[sectionIndex] = { ...section, blocks: newBlocks };
                                                                        setEditData({ ...editData, sections: newSections });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <img src={block.icon.src} alt={block.icon.alt} className="w-8 h-8 object-cover rounded" />
                                                                <span className="font-medium">{block.title}</span>
                                                            </div>
                                                            <div className="space-y-2 mb-3">
                                                                {Object.entries(block.content.data || {}).map(([key, value]) => (
                                                                    <div key={key} className="flex justify-between items-center text-sm">
                                                                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                                        <span className="font-semibold">{String(value)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500 italic">{block.content.note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Impact Summary Section */}
                            {'cards' in section && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h6 className="font-semibold">Impact Cards ({section.cards?.length || 0})</h6>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => {
                                                    const newCard = {
                                                        title: 'New Metric',
                                                        subtitle: 'New Description',
                                                        details: 'Additional details',
                                                    };
                                                    const newSections = [...editData.sections];
                                                    newSections[sectionIndex] = {
                                                        ...section,
                                                        cards: [...(section.cards || []), newCard],
                                                    };
                                                    setEditData({ ...editData, sections: newSections });
                                                }}
                                            >
                                                <IconPlus className="h-4 w-4 mr-1" />
                                                Add Card
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        {section.cards?.map((card: any, cardIndex: number) => (
                                            <div key={cardIndex} className="panel border">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h6 className="font-medium text-lg">{card.title}</h6>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => {
                                                                const newSections = [...editData.sections];
                                                                newSections[sectionIndex] = {
                                                                    ...section,
                                                                    cards: section.cards.filter((_: any, i: number) => i !== cardIndex),
                                                                };
                                                                setEditData({ ...editData, sections: newSections });
                                                            }}
                                                        >
                                                            <IconTrash className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="form-label text-sm">Title</label>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={card.title}
                                                                onChange={(e) => {
                                                                    const newSections = [...editData.sections];
                                                                    const newCards = [...section.cards];
                                                                    newCards[cardIndex] = { ...card, title: e.target.value };
                                                                    newSections[sectionIndex] = { ...section, cards: newCards };
                                                                    setEditData({ ...editData, sections: newSections });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="form-label text-sm">Subtitle</label>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={card.subtitle}
                                                                onChange={(e) => {
                                                                    const newSections = [...editData.sections];
                                                                    const newCards = [...section.cards];
                                                                    newCards[cardIndex] = { ...card, subtitle: e.target.value };
                                                                    newSections[sectionIndex] = { ...section, cards: newCards };
                                                                    setEditData({ ...editData, sections: newSections });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="form-label text-sm">Details</label>
                                                            <textarea
                                                                className="form-textarea"
                                                                rows={2}
                                                                value={card.details}
                                                                onChange={(e) => {
                                                                    const newSections = [...editData.sections];
                                                                    const newCards = [...section.cards];
                                                                    newCards[cardIndex] = { ...card, details: e.target.value };
                                                                    newSections[sectionIndex] = { ...section, cards: newCards };
                                                                    setEditData({ ...editData, sections: newSections });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-medium text-sm">{card.subtitle}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{card.details}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {section.quote && (
                                        <div className="mt-6">
                                            <h6 className="font-semibold mb-3">Quote Section</h6>
                                            <div className="panel border">
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="form-label">Quote Headline</label>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={section.quote.headline}
                                                                onChange={(e) => {
                                                                    const newSections = [...editData.sections];
                                                                    newSections[sectionIndex] = {
                                                                        ...section,
                                                                        quote: { ...section.quote, headline: e.target.value },
                                                                    };
                                                                    setEditData({ ...editData, sections: newSections });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="form-label">Quote Description</label>
                                                            <textarea
                                                                className="form-textarea"
                                                                rows={2}
                                                                value={section.quote.description}
                                                                onChange={(e) => {
                                                                    const newSections = [...editData.sections];
                                                                    newSections[sectionIndex] = {
                                                                        ...section,
                                                                        quote: { ...section.quote, description: e.target.value },
                                                                    };
                                                                    setEditData({ ...editData, sections: newSections });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{section.quote.headline}</h4>
                                                        <p className="text-sm text-gray-600">{section.quote.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {section.cta && (
                                        <div className="mt-6">
                                            <h6 className="font-semibold mb-3">Call-to-Action Buttons</h6>
                                            <div className="space-y-3">
                                                {section.cta.map((cta: any, ctaIndex: number) => {
                                                    const ctaKey = `${sectionIndex}-${ctaIndex}`;
                                                    return (
                                                        <div key={ctaIndex} className="panel border">
                                                            {isEditing ? (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="form-label text-sm">CTA Text</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-input"
                                                                            value={cta.text}
                                                                            onChange={(e) => {
                                                                                const newSections = [...editData.sections];
                                                                                const newCTA = [...section.cta];
                                                                                newCTA[ctaIndex] = { ...cta, text: e.target.value };
                                                                                newSections[sectionIndex] = { ...section, cta: newCTA };
                                                                                setEditData({ ...editData, sections: newSections });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="form-label text-sm">CTA Link</label>
                                                                        <div className="space-y-2">
                                                                            <div className="flex gap-2">
                                                                                <label className="flex items-center">
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`ctaLinkType-${ctaKey}`}
                                                                                        checked={ctaLinkTypes[ctaKey] === 'navigation'}
                                                                                        onChange={() => setCtaLinkTypes({ ...ctaLinkTypes, [ctaKey]: 'navigation' })}
                                                                                        className="form-radio"
                                                                                    />
                                                                                    <span className="ml-1 text-xs">Navigation</span>
                                                                                </label>
                                                                                <label className="flex items-center">
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`ctaLinkType-${ctaKey}`}
                                                                                        checked={ctaLinkTypes[ctaKey] === 'manual' || !ctaLinkTypes[ctaKey]}
                                                                                        onChange={() => setCtaLinkTypes({ ...ctaLinkTypes, [ctaKey]: 'manual' })}
                                                                                        className="form-radio"
                                                                                    />
                                                                                    <span className="ml-1 text-xs">Manual</span>
                                                                                </label>
                                                                            </div>
                                                                            {ctaLinkTypes[ctaKey] === 'navigation' ? (
                                                                                <select
                                                                                    className="form-select"
                                                                                    value={cta.link || ''}
                                                                                    onChange={(e) => {
                                                                                        const newSections = [...editData.sections];
                                                                                        const newCTA = [...section.cta];
                                                                                        newCTA[ctaIndex] = { ...cta, link: e.target.value };
                                                                                        newSections[sectionIndex] = { ...section, cta: newCTA };
                                                                                        setEditData({ ...editData, sections: newSections });
                                                                                    }}
                                                                                >
                                                                                    <option value="">Select navigation...</option>
                                                                                    {allNavItems.map((item: any) => (
                                                                                        <option key={item.id} value={item.slug}>
                                                                                            {item.displayName} - {item.slug}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            ) : (
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-input"
                                                                                    value={cta.link}
                                                                                    onChange={(e) => {
                                                                                        const newSections = [...editData.sections];
                                                                                        const newCTA = [...section.cta];
                                                                                        newCTA[ctaIndex] = { ...cta, link: e.target.value };
                                                                                        newSections[sectionIndex] = { ...section, cta: newCTA };
                                                                                        setEditData({ ...editData, sections: newSections });
                                                                                    }}
                                                                                    placeholder="/custom-link or https://example.com"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <span className="font-medium">{cta.text}</span>
                                                                    <span className="text-sm text-gray-500 ml-2">→ {cta.link}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
