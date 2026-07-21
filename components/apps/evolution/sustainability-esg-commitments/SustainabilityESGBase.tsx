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
import { useUpdateSustainabilityESG } from './hooks/useUpdateSustainabilityESG';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchSustainabilityESG(): Promise<any | null> {
    try {
        const response = await fetch('/api/evolution/sustainability-esg-commitments');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching sustainability ESG:', error);
        throw error;
    }
}

export default function SustainabilityESGBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [iconImages, setIconImages] = useState<{ [key: string]: any[] }>({});
    const { uploadImage, isUploading } = useImageUpload();
    
    // Media Picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<number | null>(null); // section index
    
    // CTA Link Types state
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const {
        data: sustainabilityData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['evolution-sustainability-esg'],
        queryFn: fetchSustainabilityESG,
    });
    
    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const updateMutation = useUpdateSustainabilityESG();
    
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

    useEffect(() => {
        if (sustainabilityData) {
            setEditData({
                header: sustainabilityData.header,
                sections: sustainabilityData.sections,
                quote: sustainabilityData.quote,
                tagline: sustainabilityData.tagline,
                callToActions: sustainabilityData.callToActions,
            });
        }
    }, [sustainabilityData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (sustainabilityData) {
            setEditData({
                header: sustainabilityData.header,
                sections: sustainabilityData.sections,
                quote: sustainabilityData.quote,
                tagline: sustainabilityData.tagline,
                callToActions: sustainabilityData.callToActions,
            });
        }
        setIconImages({});
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            const payload = sustainabilityData?.id 
                ? { id: sustainabilityData.id, data: editData }
                : { data: editData };
            
            await updateMutation.mutateAsync(payload);
            setIsEditing(false);
            setIconImages({});

            Swal.fire({
                title: 'Success!',
                text: 'Sustainability & ESG Commitments updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating sustainability ESG:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update sustainability & ESG commitments',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle icon image upload
    const handleIconImageChange = async (sectionIndex: number, imageList: ImageListType) => {
        const key = `section-${sectionIndex}`;
        setIconImages({ ...iconImages, [key]: imageList });

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, `evolution/sustainability/section-${sectionIndex}-icon`);
                const newSections = [...editData.sections];
                newSections[sectionIndex] = {
                    ...newSections[sectionIndex],
                    icon: {
                        ...newSections[sectionIndex].icon,
                        src: result.url,
                    },
                };
                setEditData({
                    ...editData,
                    sections: newSections,
                });

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
                setIconImages({ ...iconImages, [key]: [] });
            }
        }
    };

    // Media Picker handlers
    const openMediaPicker = (sectionIndex: number) => {
        setMediaPickerTarget(sectionIndex);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (url: string, file?: any) => {
        if (mediaPickerTarget === null) return;

        const newSections = [...editData.sections];
        newSections[mediaPickerTarget] = {
            ...newSections[mediaPickerTarget],
            icon: {
                ...newSections[mediaPickerTarget].icon,
                src: url,
            },
        };
        setEditData({
            ...editData,
            sections: newSections,
        });

        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    // Handle sections
    const addSection = () => {
        setEditData({
            ...editData,
            sections: [
                ...editData.sections,
                {
                    id: `section-${Date.now()}`,
                    heading: '',
                    icon: { src: '', alt: '' },
                    points: [''],
                },
            ],
        });
    };

    const removeSection = (index: number) => {
        const newSections = editData.sections.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            sections: newSections,
        });
    };

    const updateSection = (index: number, field: string, value: any) => {
        const newSections = [...editData.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setEditData({
            ...editData,
            sections: newSections,
        });
    };

    // Handle section points
    const addSectionPoint = (sectionIndex: number) => {
        const newSections = [...editData.sections];
        newSections[sectionIndex].points.push('');
        setEditData({
            ...editData,
            sections: newSections,
        });
    };

    const removeSectionPoint = (sectionIndex: number, pointIndex: number) => {
        const newSections = [...editData.sections];
        newSections[sectionIndex].points = newSections[sectionIndex].points.filter((_: any, i: number) => i !== pointIndex);
        setEditData({
            ...editData,
            sections: newSections,
        });
    };

    const updateSectionPoint = (sectionIndex: number, pointIndex: number, value: string) => {
        const newSections = [...editData.sections];
        newSections[sectionIndex].points[pointIndex] = value;
        setEditData({
            ...editData,
            sections: newSections,
        });
    };

    // Handle call to actions
    const addCallToAction = () => {
        setEditData({
            ...editData,
            callToActions: [...editData.callToActions, { text: '', href: '' }],
        });
    };

    const removeCallToAction = (index: number) => {
        const newCTAs = editData.callToActions.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            callToActions: newCTAs,
        });
    };

    const updateCallToAction = (index: number, field: string, value: string) => {
        const newCTAs = [...editData.callToActions];
        newCTAs[index] = { ...newCTAs[index], [field]: value };
        setEditData({
            ...editData,
            callToActions: newCTAs,
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading sustainability & ESG commitments</div>
            </div>
        );
    }

    if (!sustainabilityData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No sustainability & ESG commitments found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                header: {
                                    title: 'SUSTAINABILITY & ESG COMMITMENTS',
                                    subtitle: '',
                                },
                                sections: [],
                                quote: {
                                    text: '',
                                    attribution: null,
                                },
                                tagline: '',
                                callToActions: [],
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Sustainability & ESG Commitments
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
                    <h5 className="text-lg font-semibold dark:text-white-light">Sustainability & ESG Commitments</h5>
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
                {/* Header Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Header</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.header?.title || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            header: { ...editData.header, title: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{sustainabilityData?.header?.title}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Subtitle</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={editData?.header?.subtitle || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            header: { ...editData.header, subtitle: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[100px] p-3">{sustainabilityData?.header?.subtitle}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Sections</h6>
                        {isEditing && (
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addSection}>
                                <IconPlus className="h-4 w-4 mr-1" />
                                Add Section
                            </button>
                        )}
                    </div>
                    <div className="space-y-6">
                        {(isEditing ? editData?.sections : sustainabilityData?.sections)?.map((section: any, sectionIndex: number) => (
                            <div key={sectionIndex} className="border rounded p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-semibold">Section {sectionIndex + 1}</h6>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeSection(sectionIndex)}
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="form-label">ID</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={section.id}
                                                onChange={(e) => updateSection(sectionIndex, 'id', e.target.value)}
                                            />
                                        ) : (
                                            <div className="form-input bg-gray-100">{section.id}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="form-label">Heading</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={section.heading}
                                                onChange={(e) => updateSection(sectionIndex, 'heading', e.target.value)}
                                            />
                                        ) : (
                                            <div className="form-input bg-gray-100">{section.heading}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Icon */}
                                <div className="mb-4">
                                    <label className="form-label">Icon</label>
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            {section.icon?.src && (
                                                <div className="border rounded p-2">
                                                    <img src={section.icon.src} alt={section.icon.alt} className="w-16 h-16 object-contain rounded mb-2" />
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-gray-600 truncate flex-1">{section.icon.src}</p>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateSection(sectionIndex, 'icon', { ...section.icon, src: '' })
                                                            }
                                                            className="btn btn-danger btn-xs ml-2"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openMediaPicker(sectionIndex)}
                                                className="btn btn-outline-primary btn-sm w-full"
                                            >
                                                Browse Media
                                            </button>
                                            <ImageUploading 
                                                value={iconImages[`section-${sectionIndex}`] || []} 
                                                onChange={(imageList) => handleIconImageChange(sectionIndex, imageList)} 
                                                maxNumber={1} 
                                                dataURLKey="dataURL"
                                            >
                                                {({ onImageUpload, isDragging, dragProps }) => (
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

                                            <div className="grid grid-cols-1 gap-2">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={section.icon?.src || ''}
                                                    onChange={(e) =>
                                                        updateSection(sectionIndex, 'icon', { ...section.icon, src: e.target.value })
                                                    }
                                                    placeholder="Icon URL"
                                                />
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={section.icon?.alt || ''}
                                                    onChange={(e) =>
                                                        updateSection(sectionIndex, 'icon', { ...section.icon, alt: e.target.value })
                                                    }
                                                    placeholder="Alt text"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border rounded p-2">
                                            {section.icon?.src ? (
                                                <>
                                                    <img src={section.icon.src} alt={section.icon.alt} className="w-16 h-16 object-contain rounded mb-2" />
                                                    <p className="text-xs text-gray-600 truncate">{section.icon.src}</p>
                                                </>
                                            ) : (
                                                <div className="text-gray-500 text-center py-8">No icon</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Points */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="form-label">Points</label>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => addSectionPoint(sectionIndex)}
                                            >
                                                <IconPlus className="h-4 w-4 mr-1" />
                                                Add Point
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {section.points?.map((point: string, pointIndex: number) => (
                                            <div key={pointIndex} className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="form-input flex-1"
                                                            value={point}
                                                            onChange={(e) => updateSectionPoint(sectionIndex, pointIndex, e.target.value)}
                                                            placeholder={`Point ${pointIndex + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeSectionPoint(sectionIndex, pointIndex)}
                                                        >
                                                            <IconTrash className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="form-input bg-gray-100 flex-1">{point}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quote */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Quote</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Text</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={editData?.quote?.text || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            quote: { ...editData.quote, text: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{sustainabilityData?.quote?.text}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Attribution (optional)</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.quote?.attribution || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            quote: { ...editData.quote, attribution: e.target.value || null },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{sustainabilityData?.quote?.attribution || 'No attribution'}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Tagline</h6>
                    <div>
                        <label className="form-label">Tagline</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                value={editData?.tagline || ''}
                                onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                            />
                        ) : (
                            <div className="form-input bg-gray-100">{sustainabilityData?.tagline}</div>
                        )}
                    </div>
                </div>

                {/* Call to Actions */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Call to Actions</h6>
                        {isEditing && (
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addCallToAction}>
                                <IconPlus className="h-4 w-4 mr-1" />
                                Add CTA
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {(isEditing ? editData?.callToActions : sustainabilityData?.callToActions)?.map((cta: any, index: number) => (
                            <div key={index} className="border rounded p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-semibold">Call to Action {index + 1}</h6>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeCallToAction(index)}
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="form-label text-sm">Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={cta.text}
                                                onChange={(e) => updateCallToAction(index, 'text', e.target.value)}
                                                placeholder="Button text"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label text-sm">Link (href)</label>
                                            <div className="space-y-2">
                                                <div className="flex gap-4">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`ctaLinkType-${index}`}
                                                            value="navigation"
                                                            checked={ctaLinkTypes[index] === 'navigation'}
                                                            onChange={() => setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'navigation' })}
                                                            className="form-radio mr-2"
                                                        />
                                                        <span>Navigation Item</span>
                                                    </label>
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`ctaLinkType-${index}`}
                                                            value="manual"
                                                            checked={ctaLinkTypes[index] === 'manual' || !ctaLinkTypes[index]}
                                                            onChange={() => setCtaLinkTypes({ ...ctaLinkTypes, [index]: 'manual' })}
                                                            className="form-radio mr-2"
                                                        />
                                                        <span>Manual URL</span>
                                                    </label>
                                                </div>

                                                {ctaLinkTypes[index] === 'navigation' ? (
                                                    <select
                                                        className="form-select"
                                                        value={cta.href || ''}
                                                        onChange={(e) => updateCallToAction(index, 'href', e.target.value)}
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
                                                        value={cta.href || ''}
                                                        onChange={(e) => updateCallToAction(index, 'href', e.target.value)}
                                                        placeholder="https://example.com or /page"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="form-label text-sm">Text</label>
                                            <div className="form-input bg-gray-100">{cta.text}</div>
                                        </div>
                                        <div>
                                            <label className="form-label text-sm">Link (href)</label>
                                            <div className="form-input bg-gray-100">{cta.href || 'No link'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onSelect={handleMediaSelect}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setMediaPickerTarget(null);
                    }}
                    title={`Select Icon for Section ${(mediaPickerTarget ?? 0) + 1}`}
                />
            )}
        </div>
    );
}