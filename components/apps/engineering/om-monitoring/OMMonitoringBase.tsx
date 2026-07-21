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
import { useUpdateOMMonitoring } from './hooks/useUpdateOMMonitoring';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchOMMonitoring(): Promise<any | null> {
    try {
        const response = await fetch('/api/engineering/om-monitoring');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching O&M monitoring:', error);
        throw error;
    }
}

export default function OMMonitoringBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    
    // CTA Link Types state
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const {
        data: omMonitoringData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-om-monitoring'],
        queryFn: fetchOMMonitoring,
    });
    
    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const updateMutation = useUpdateOMMonitoring();
    
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
        if (omMonitoringData) {
            setEditData({
                header: omMonitoringData.header,
                philosophy: omMonitoringData.philosophy,
                whyMatters: omMonitoringData.whyMatters,
                services: omMonitoringData.services,
                callToActions: omMonitoringData.callToActions,
            });
        }
    }, [omMonitoringData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (omMonitoringData) {
            setEditData({
                header: omMonitoringData.header,
                philosophy: omMonitoringData.philosophy,
                whyMatters: omMonitoringData.whyMatters,
                services: omMonitoringData.services,
                callToActions: omMonitoringData.callToActions,
            });
        }
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            const payload = omMonitoringData?.id 
                ? { id: omMonitoringData.id, data: editData }
                : { data: editData };
            
            await updateMutation.mutateAsync(payload);
            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'O&M Monitoring updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating O&M monitoring:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update O&M monitoring',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle philosophy items
    const addPhilosophyItem = () => {
        setEditData({
            ...editData,
            philosophy: {
                ...editData.philosophy,
                items: [...editData.philosophy.items, { title: '', description: '' }],
            },
        });
    };

    const removePhilosophyItem = (index: number) => {
        const newItems = editData.philosophy.items.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            philosophy: {
                ...editData.philosophy,
                items: newItems,
            },
        });
    };

    const updatePhilosophyItem = (index: number, field: string, value: string) => {
        const newItems = [...editData.philosophy.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditData({
            ...editData,
            philosophy: {
                ...editData.philosophy,
                items: newItems,
            },
        });
    };

    // Handle why matters points
    const addWhyMattersPoint = () => {
        setEditData({
            ...editData,
            whyMatters: {
                ...editData.whyMatters,
                points: [...editData.whyMatters.points, ''],
            },
        });
    };

    const removeWhyMattersPoint = (index: number) => {
        const newPoints = editData.whyMatters.points.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            whyMatters: {
                ...editData.whyMatters,
                points: newPoints,
            },
        });
    };

    const updateWhyMattersPoint = (index: number, value: string) => {
        const newPoints = [...editData.whyMatters.points];
        newPoints[index] = value;
        setEditData({
            ...editData,
            whyMatters: {
                ...editData.whyMatters,
                points: newPoints,
            },
        });
    };

    // Handle service items
    const addServiceItem = () => {
        setEditData({
            ...editData,
            services: {
                ...editData.services,
                items: [...editData.services.items, { title: '', description: '' }],
            },
        });
    };

    const removeServiceItem = (index: number) => {
        const newItems = editData.services.items.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            services: {
                ...editData.services,
                items: newItems,
            },
        });
    };

    const updateServiceItem = (index: number, field: string, value: string) => {
        const newItems = [...editData.services.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditData({
            ...editData,
            services: {
                ...editData.services,
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
                <div className="text-lg text-red-600">Error loading O&M monitoring</div>
            </div>
        );
    }

    if (!omMonitoringData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No O&M monitoring found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                header: {
                                    title: 'O&M & MONITORING',
                                    subtitle: '',
                                    description: '',
                                },
                                philosophy: {
                                    heading: 'Our O&M Philosophy',
                                    items: [],
                                },
                                whyMatters: {
                                    heading: 'Why This Matters',
                                    points: [],
                                },
                                services: {
                                    items: [],
                                },
                                callToActions: [],
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create O&M Monitoring
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
                    <h5 className="text-lg font-semibold dark:text-white-light">O&M & Monitoring</h5>
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
                                <div className="form-input bg-gray-100">{omMonitoringData?.header?.title}</div>
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
                                <div className="form-input bg-gray-100">{omMonitoringData?.header?.subtitle}</div>
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
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{omMonitoringData?.header?.description}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Philosophy Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">O&M Philosophy</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.philosophy?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            philosophy: { ...editData.philosophy, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{omMonitoringData?.philosophy?.heading}</div>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">Philosophy Items</label>
                                {isEditing && (
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addPhilosophyItem}>
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {(isEditing ? editData?.philosophy?.items : omMonitoringData?.philosophy?.items)?.map((item: any, index: number) => (
                                    <div key={index} className="border rounded p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-medium">Item {index + 1}</h6>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removePhilosophyItem(index)}
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
                                                        value={item.title}
                                                        onChange={(e) => updatePhilosophyItem(index, 'title', e.target.value)}
                                                        placeholder="Item title"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Description</label>
                                                    <textarea
                                                        className="form-textarea"
                                                        rows={3}
                                                        value={item.description}
                                                        onChange={(e) => updatePhilosophyItem(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="form-label text-sm">Title</label>
                                                    <div className="form-input bg-gray-100">{item.title}</div>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Description</label>
                                                    <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{item.description}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why This Matters Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Why This Matters</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.whyMatters?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            whyMatters: { ...editData.whyMatters, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{omMonitoringData?.whyMatters?.heading}</div>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">Points</label>
                                {isEditing && (
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addWhyMattersPoint}>
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add Point
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {(isEditing ? editData?.whyMatters?.points : omMonitoringData?.whyMatters?.points)?.map((point: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className="form-input flex-1"
                                                    value={point}
                                                    onChange={(e) => updateWhyMattersPoint(index, e.target.value)}
                                                    placeholder={`Point ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeWhyMattersPoint(index)}
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
                </div>

                {/* Services Section */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Services</h6>
                        {isEditing && (
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addServiceItem}>
                                <IconPlus className="h-4 w-4 mr-1" />
                                Add Service
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {(isEditing ? editData?.services?.items : omMonitoringData?.services?.items)?.map((item: any, index: number) => (
                            <div key={index} className="border rounded p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium">Service {index + 1}</h6>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeServiceItem(index)}
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
                                                onChange={(e) => updateServiceItem(index, 'title', e.target.value)}
                                                placeholder="Service title"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label text-sm">Description</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={item.description}
                                                onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                                                placeholder="Service description"
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
                        {(isEditing ? editData?.callToActions : omMonitoringData?.callToActions)?.map((cta: any, index: number) => (
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