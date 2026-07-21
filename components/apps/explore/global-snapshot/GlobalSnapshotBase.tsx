'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exploreGlobalSnapshotApi, exploreGlobalSnapshotKeys } from '@/lib/api/exploreGlobalSnapshot';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';
import { useUpdateGlobalSnapshotById } from './hooks/useUpdateGlobalSnapshot';
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
import '../about-us/quill-styles.css';
import { 
    HeroSectionEditor, 
    StatisticsGridEditor, 
    HighlightBoxEditor, 
    ContentBlockEditor, 
    LocationsSectionEditor, 
    ActionButtonsEditor 
} from './sections';

// Type definitions for Global Snapshot sections
interface ImageObject {
    src: string;
    alt: string;
}

interface HeroSection {
    type: 'hero-section';
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: ImageObject;
}

interface StatItem {
    icon: ImageObject;
    value: string;
    label: string;
}

interface StatisticsGridSection {
    type: 'statistics-grid';
    title: string;
    items: StatItem[];
}

interface HighlightItem {
    icon: ImageObject;
    title: string;
    description: string;
}

interface HighlightBoxSection {
    type: 'highlight-box';
    title: string;
    features: HighlightItem[];
}

interface ContentBlockSection {
    type: 'content-block';
    title: string;
    content: string;
    image: ImageObject;
    imagePosition: 'left' | 'right';
}

interface Location {
    name: string;
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface LocationsSection {
    type: 'locations-section';
    title: string;
    locations: Location[];
}

interface ActionButton {
    icon: ImageObject;
    label: string;
    url: string;
    variant: 'primary' | 'secondary';
}

interface ActionButtonsSection {
    type: 'action-buttons';
    title: string;
    buttons: ActionButton[];
}

type Section = HeroSection | StatisticsGridSection | HighlightBoxSection | 
               ContentBlockSection | LocationsSection | ActionButtonsSection;

interface GlobalSnapshotBaseProps {
    entryId?: string;
}

export default function GlobalSnapshotBase({ entryId = '1' }: GlobalSnapshotBaseProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerConfig, setMediaPickerConfig] = useState<{
        sectionIndex: number;
        itemIndex?: number;
        field: string;
        allowedTypes: ('image' | 'video' | 'raw')[];
    } | null>(null);

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
        data: globalSnapshot,
        isLoading,
        error,
    } = useQuery({
        queryKey: exploreGlobalSnapshotKeys.detail(entryId),
        queryFn: async () => {
            try {
                return await exploreGlobalSnapshotApi.getById(entryId);
            } catch (error) {
                // If specific ID not found, try to get the first available entry
                console.log(`ID "${entryId}" not found, trying to get first available entry`);
                const allEntries = await exploreGlobalSnapshotApi.getAll();
                if (allEntries.length > 0) {
                    return allEntries[0];
                }
                throw error;
            }
        },
    });

    const updateMutation = useUpdateGlobalSnapshotById();

    useEffect(() => {
        if (globalSnapshot) {
            setEditData({
                sections: globalSnapshot.sections || [],
            });
        }
    }, [globalSnapshot]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (globalSnapshot) {
            setEditData({
                sections: globalSnapshot.sections || [],
            });
        }
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                id: entryId,
                data: {
                    sections: editData.sections,
                },
            });

            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'Global Snapshot updated successfully',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update Global Snapshot',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    // Handle image upload for icons
    const handleIconImageUpload = async (sectionIndex: number, itemIndex: number, imageList: ImageListType, iconPath: string = 'icon') => {
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'explore/global-snapshot/icons');
                
                const updatedSections: Section[] = [...editData.sections];
                const section: any = updatedSections[sectionIndex];
                
                if (iconPath === 'icon') {
                    // For simple icon updates
                    if (section.items) {
                        section.items[itemIndex].icon.src = result.url;
                    } else if (section.features) {
                        section.features[itemIndex].icon.src = result.url;
                    } else if (section.buttons) {
                        section.buttons[itemIndex].icon.src = result.url;
                    }
                } else {
                    // For nested icon updates
                    const pathParts = iconPath.split('.');
                    let target: any = section;
                    for (let i = 0; i < pathParts.length - 1; i++) {
                        target = target[pathParts[i]];
                    }
                    target[pathParts[pathParts.length - 1]].src = result.url;
                }
                
                setEditData({ ...editData, sections: updatedSections });
                
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
            }
        }
    };

    // Add new section
    const addSection = (type: string) => {
        const newSection = createNewSection(type);
        setEditData({ 
            ...editData, 
            sections: [...editData.sections, newSection] 
        });
    };

    // Open media picker
    const openMediaPicker = (
        sectionIndex: number, 
        field: string, 
        itemIndex?: number, 
        allowedTypes: ('image' | 'video' | 'raw')[] = ['image']
    ) => {
        setMediaPickerConfig({ sectionIndex, itemIndex, field, allowedTypes });
        setShowMediaPicker(true);
    };

    // Handle media selection from picker
    const handleMediaSelect = (url: string, file?: any) => {
        if (!mediaPickerConfig) return;

        const { sectionIndex, itemIndex, field } = mediaPickerConfig;
        const updatedSections = [...editData.sections];
        const section = updatedSections[sectionIndex];

        // Handle different field types
        if (itemIndex !== undefined) {
            // For array items (buttons, features, items, etc.)
            if (field === 'items') {
                // For statistics grid items
                if (section.items && section.items[itemIndex]) {
                    section.items[itemIndex].icon.src = url;
                }
            } else if (field === 'features') {
                // For content block features
                if (section.features && section.features[itemIndex]) {
                    section.features[itemIndex].icon.src = url;
                }
            } else if (field === 'buttons') {
                // For action buttons
                if (section.buttons && section.buttons[itemIndex]) {
                    section.buttons[itemIndex].icon.src = url;
                }
            }
        } else {
            // For direct fields (like hero section background)
            if (field.includes('.')) {
                const parts = field.split('.');
                let target: any = section;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!target[parts[i]]) target[parts[i]] = {};
                    target = target[parts[i]];
                }
                target[parts[parts.length - 1]] = url;
            } else {
                section[field] = url;
            }
        }

        setEditData({ ...editData, sections: updatedSections });
        setShowMediaPicker(false);
        setMediaPickerConfig(null);
    };

    // Remove section
    const removeSection = (index: number) => {
        const updatedSections = editData.sections.filter((_section: any, i: number) => i !== index);
        setEditData({ ...editData, sections: updatedSections });
    };

    // Move section up/down
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const updatedSections: Section[] = [...editData.sections];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (newIndex >= 0 && newIndex < updatedSections.length) {
            [updatedSections[index], updatedSections[newIndex]] = [updatedSections[newIndex], updatedSections[index]];
            setEditData({ ...editData, sections: updatedSections });
        }
    };

    // Update section field
    const updateSection = (sectionIndex: number, field: string, value: any) => {
        const updatedSections: Section[] = [...editData.sections];
        const section: any = updatedSections[sectionIndex];
        
        if (field.includes('.')) {
            const fieldParts = field.split('.');
            let target: any = section;
            for (let i = 0; i < fieldParts.length - 1; i++) {
                if (!target[fieldParts[i]]) {
                    target[fieldParts[i]] = {};
                }
                target = target[fieldParts[i]];
            }
            target[fieldParts[fieldParts.length - 1]] = value;
        } else {
            section[field] = value;
        }
        
        setEditData({ ...editData, sections: updatedSections });
    };

    // Add item to array fields
    const addArrayItem = (sectionIndex: number, arrayField: string, newItem: any) => {
        const updatedSections: Section[] = [...editData.sections];
        const section: any = updatedSections[sectionIndex];
        
        if (!section[arrayField]) {
            section[arrayField] = [];
        }
        section[arrayField].push(newItem);
        
        setEditData({ ...editData, sections: updatedSections });
    };

    // Remove item from array fields
    const removeArrayItem = (sectionIndex: number, arrayField: string, itemIndex: number) => {
        const updatedSections: Section[] = [...editData.sections];
        const section: any = updatedSections[sectionIndex];
        
        if (section[arrayField]) {
            section[arrayField].splice(itemIndex, 1);
        }
        
        setEditData({ ...editData, sections: updatedSections });
    };

    // Create new section based on type
    const createNewSection = (type: string) => {
        const baseId = `${type}-${Date.now()}`;
        
        switch (type) {
            case 'hero-section':
                return {
                    id: baseId,
                    type: 'hero-section',
                    title: { main: '', highlight: '' },
                    subtitle: '',
                    headline: '',
                    description: []
                };
            case 'statistics-grid':
                return {
                    id: baseId,
                    type: 'statistics-grid',
                    items: []
                };
            case 'highlight-box':
                return {
                    id: baseId,
                    type: 'highlight-box',
                    content: { lines: [], style: 'italic-green-highlight' }
                };
            case 'content-block':
                return {
                    id: baseId,
                    type: 'content-block',
                    title: { text: '', highlight: '' },
                    features: []
                };
            case 'locations-section':
                return {
                    id: baseId,
                    type: 'locations-section',
                    title: '',
                    locations: [],
                    description: '',
                    highlight: ''
                };
            case 'action-buttons':
                return {
                    id: baseId,
                    type: 'action-buttons',
                    buttons: []
                };
            default:
                return {
                    id: baseId,
                    type: type,
                };
        }
    };

    if (isLoading) return <Loading />;
    if (error) {
        console.error('Global Snapshot loading error:', error);
        return (
            <div className="panel">
                <div className="text-red-500 p-4">
                    <h3 className="font-semibold mb-2">Error loading Global Snapshot content</h3>
                    <p className="text-sm">Looking for ID: "{entryId}"</p>
                    <p className="text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
            </div>
        );
    }
    if (!globalSnapshot || !editData) {
        return (
            <div className="panel">
                <div className="text-gray-500 p-4">
                    <h3 className="font-semibold mb-2">No Global Snapshot content found</h3>
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
                    <h5 className="font-semibold text-lg">Global Snapshot Management</h5>
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

            {/* Add Section Buttons */}
            {isEditing && (
                <div className="panel mb-6">
                    <h6 className="text-lg font-semibold mb-4">Add New Section</h6>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => addSection('hero-section')}
                            className="btn btn-outline-primary btn-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            Hero Section
                        </button>
                        <button 
                            onClick={() => addSection('statistics-grid')}
                            className="btn btn-outline-primary btn-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            Statistics Grid
                        </button>
                        <button 
                            onClick={() => addSection('highlight-box')}
                            className="btn btn-outline-primary btn-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            Highlight Box
                        </button>
                        <button 
                            onClick={() => addSection('content-block')}
                            className="btn btn-outline-primary btn-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            Content Block
                        </button>
                        <button 
                            onClick={() => addSection('locations-section')}
                            className="btn btn-outline-primary btn-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            Locations
                        </button>
                        <button 
                            onClick={() => addSection('action-buttons')}
                            className="btn btn-outline-primary btn-sm"
                        >
                            <IconPlus className="w-4 h-4" />
                            Action Buttons
                        </button>
                    </div>
                </div>
            )}

            {/* Sections */}
            <div className="space-y-6">
                {(isEditing ? editData.sections : globalSnapshot.sections)?.map((section: Section, sectionIndex: number) => (
                    <div key={(section as any).id || sectionIndex} className="panel border-2 border-dashed border-gray-300">
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm uppercase tracking-wide text-gray-600">
                                    {section.type.replace('-', ' ')}
                                </span>
                                <span className="text-xs text-gray-500">({(section as any).id})</span>
                            </div>
                            
                            {isEditing && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => moveSection(sectionIndex, 'up')}
                                        className="btn btn-outline-secondary btn-xs"
                                        disabled={sectionIndex === 0}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => moveSection(sectionIndex, 'down')}
                                        className="btn btn-outline-secondary btn-xs"
                                        disabled={sectionIndex === editData.sections.length - 1}
                                    >
                                        ↓
                                    </button>
                                    <button
                                        onClick={() => removeSection(sectionIndex)}
                                        className="btn btn-danger btn-xs"
                                    >
                                        <IconTrash className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Section Content */}
                        {section.type === 'hero-section' && (
                            <HeroSectionEditor 
                                section={section}
                                isEditing={isEditing}
                                onUpdate={(field, value) => updateSection(sectionIndex, field, value)}
                                onOpenMediaPicker={() => openMediaPicker(sectionIndex, 'backgroundImage.src', undefined, ['image'])}
                            />
                        )}

                        {section.type === 'statistics-grid' && (
                            <StatisticsGridEditor 
                                section={section}
                                isEditing={isEditing}
                                onUpdate={(field, value) => updateSection(sectionIndex, field, value)}
                                onAddItem={(item) => addArrayItem(sectionIndex, 'items', item)}
                                onRemoveItem={(itemIndex) => removeArrayItem(sectionIndex, 'items', itemIndex)}
                                onImageUpload={(itemIndex, imageList) => handleIconImageUpload(sectionIndex, itemIndex, imageList)}
                                isUploading={isUploading}
                                onOpenMediaPicker={(itemIndex) => openMediaPicker(sectionIndex, 'items', itemIndex, ['image'])}
                            />
                        )}

                        {section.type === 'highlight-box' && (
                            <HighlightBoxEditor 
                                section={section}
                                isEditing={isEditing}
                                onUpdate={(field: string, value: any) => updateSection(sectionIndex, field, value)}
                                onAddLine={(line: any) => {
                                    const currentSection = section as any;
                                    const updatedLines = [...(currentSection.content?.lines || []), line];
                                    updateSection(sectionIndex, 'content.lines', updatedLines);
                                }}
                                onRemoveLine={(lineIndex: number) => {
                                    const currentSection = section as any;
                                    const updatedLines = currentSection.content.lines.filter((_line: any, i: number) => i !== lineIndex);
                                    updateSection(sectionIndex, 'content.lines', updatedLines);
                                }}
                            />
                        )}

                        {section.type === 'content-block' && (
                            <ContentBlockEditor 
                                section={section}
                                isEditing={isEditing}
                                onUpdate={(field: string, value: any) => updateSection(sectionIndex, field, value)}
                                onAddFeature={(feature: any) => addArrayItem(sectionIndex, 'features', feature)}
                                onRemoveFeature={(featureIndex: number) => removeArrayItem(sectionIndex, 'features', featureIndex)}
                                onImageUpload={(featureIndex: number, imageList: ImageListType) => handleIconImageUpload(sectionIndex, featureIndex, imageList)}
                                isUploading={isUploading}
                                onOpenMediaPicker={(featureIndex: number) => openMediaPicker(sectionIndex, 'features', featureIndex, ['image'])}
                            />
                        )}

                        {section.type === 'locations-section' && (
                            <LocationsSectionEditor 
                                section={section}
                                isEditing={isEditing}
                                onUpdate={(field:any, value:any) => updateSection(sectionIndex, field, value)}
                                onAddLocation={(location:any) => {
                                    const updatedLocations = [...(section.locations || []), location];
                                    updateSection(sectionIndex, 'locations', updatedLocations);
                                }}
                                onRemoveLocation={(locationIndex:any) => {
                                    const updatedLocations = section.locations.filter((_: any, i: number) => i !== locationIndex);
                                    updateSection(sectionIndex, 'locations', updatedLocations);
                                }}
                            />
                        )}

                        {section.type === 'action-buttons' && (
                            <ActionButtonsEditor 
                                section={section}
                                isEditing={isEditing}
                                onUpdate={(field:any, value:any) => updateSection(sectionIndex, field, value)}
                                onAddButton={(button:any) => addArrayItem(sectionIndex, 'buttons', button)}
                                onRemoveButton={(buttonIndex:any) => removeArrayItem(sectionIndex, 'buttons', buttonIndex)}
                                onImageUpload={(buttonIndex:any, imageList:any) => handleIconImageUpload(sectionIndex, buttonIndex, imageList)}
                                isUploading={isUploading}
                                navigationItems={allNavItems}
                                onOpenMediaPicker={(buttonIndex: number) => openMediaPicker(sectionIndex, 'buttons', buttonIndex, ['image'])}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && mediaPickerConfig && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setMediaPickerConfig(null);
                    }}
                    onSelect={handleMediaSelect}
                    allowedTypes={mediaPickerConfig.allowedTypes}
                    title={`Select ${mediaPickerConfig.allowedTypes.includes('video') ? 'Media' : 'Image'}`}
                    allowUrlInput={false}
                />
            )}
        </div>
    );
}