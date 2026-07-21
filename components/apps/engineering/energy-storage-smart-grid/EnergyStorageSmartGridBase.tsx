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
import { useUpdateEnergyStorageSmartGrid } from './hooks/useUpdateEnergyStorageSmartGrid';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchEnergyStorageSmartGrid(): Promise<any | null> {
    try {
        const response = await fetch('/api/engineering/energy-storage-smart-grid');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching energy storage smart grid:', error);
        throw error;
    }
}

export default function EnergyStorageSmartGridBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [iconImages, setIconImages] = useState<{ [key: string]: any[] }>({});
    const { uploadImage, isUploading } = useImageUpload();
    
    // CTA Link Types state
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const {
        data: energyStorageData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-energy-storage-smart-grid'],
        queryFn: fetchEnergyStorageSmartGrid,
    });
    
    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const updateMutation = useUpdateEnergyStorageSmartGrid();
    
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
        if (energyStorageData) {
            setEditData({
                header: energyStorageData.header,
                architecture: energyStorageData.architecture,
                quote: energyStorageData.quote,
                statement: energyStorageData.statement,
                callToActions: energyStorageData.callToActions,
            });
        }
    }, [energyStorageData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (energyStorageData) {
            setEditData({
                header: energyStorageData.header,
                architecture: energyStorageData.architecture,
                quote: energyStorageData.quote,
                statement: energyStorageData.statement,
                callToActions: energyStorageData.callToActions,
            });
        }
        setIconImages({});
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            const payload = energyStorageData?.id 
                ? { id: energyStorageData.id, data: editData }
                : { data: editData };
            
            await updateMutation.mutateAsync(payload);
            setIsEditing(false);
            setIconImages({});

            Swal.fire({
                title: 'Success!',
                text: 'Energy Storage & Smart Grid updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating energy storage smart grid:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update energy storage & smart grid',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle architecture items
    const addArchitectureItem = () => {
        setEditData({
            ...editData,
            architecture: {
                ...editData.architecture,
                items: [...editData.architecture.items, { title: '', description: '' }],
            },
        });
    };

    const removeArchitectureItem = (index: number) => {
        const newItems = editData.architecture.items.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            architecture: {
                ...editData.architecture,
                items: newItems,
            },
        });
    };

    const updateArchitectureItem = (index: number, field: string, value: string) => {
        const newItems = [...editData.architecture.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditData({
            ...editData,
            architecture: {
                ...editData.architecture,
                items: newItems,
            },
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
                <div className="text-lg text-red-600">Error loading energy storage & smart grid</div>
            </div>
        );
    }

    if (!energyStorageData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No energy storage & smart grid found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                header: {
                                    title: 'ENERGY STORAGE & SMART GRID',
                                    subtitle: '',
                                    description: '',
                                },
                                architecture: {
                                    heading: 'Our Storage Architecture',
                                    items: [],
                                },
                                quote: {
                                    text: '',
                                },
                                statement: {
                                    heading: '',
                                    description: '',
                                },
                                callToActions: [],
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Energy Storage & Smart Grid
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
                    <h5 className="text-lg font-semibold dark:text-white-light">Energy Storage & Smart Grid</h5>
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
                                <div className="form-input bg-gray-100">{energyStorageData?.header?.title}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Subtitle</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.header?.subtitle || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            header: { ...editData.header, subtitle: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{energyStorageData?.header?.subtitle}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={editData?.header?.description || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            header: { ...editData.header, description: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{energyStorageData?.header?.description}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Architecture Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Storage Architecture</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.architecture?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            architecture: { ...editData.architecture, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{energyStorageData?.architecture?.heading}</div>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">Architecture Items</label>
                                {isEditing && (
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addArchitectureItem}>
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {(isEditing ? editData?.architecture?.items : energyStorageData?.architecture?.items)?.map((item: any, index: number) => (
                                    <div key={index} className="border rounded p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-medium">Item {index + 1}</h6>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeArchitectureItem(index)}
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        {isEditing ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="form-label text-sm">Title</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={item.title}
                                                        onChange={(e) => updateArchitectureItem(index, 'title', e.target.value)}
                                                        placeholder="Item title"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Description</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={item.description}
                                                        onChange={(e) => updateArchitectureItem(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="form-label text-sm">Title</label>
                                                    <div className="form-input bg-gray-100">{item.title}</div>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Description</label>
                                                    <div className="form-input bg-gray-100">{item.description}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Quote</h6>
                    <div>
                        <label className="form-label">Text</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                value={editData?.quote?.text || ''}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        quote: { text: e.target.value },
                                    })
                                }
                            />
                        ) : (
                            <div className="form-input bg-gray-100">{energyStorageData?.quote?.text}</div>
                        )}
                    </div>
                </div>

                {/* Statement Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Statement</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.statement?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            statement: { ...editData.statement, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{energyStorageData?.statement?.heading}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={editData?.statement?.description || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            statement: { ...editData.statement, description: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{energyStorageData?.statement?.description}</div>
                            )}
                        </div>
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
                        {(isEditing ? editData?.callToActions : energyStorageData?.callToActions)?.map((cta: any, index: number) => (
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
        </div>
    );
}