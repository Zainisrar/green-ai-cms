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
import { useUpdateSolarEPCM } from './hooks/useUpdateSolarEPCM';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchSolarEPCM(): Promise<any | null> {
    try {
        const response = await fetch('/api/engineering/solar-epcm-services');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching solar EPCM services:', error);
        throw error;
    }
}

export default function SolarEPCMBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    
    // CTA Link Types state
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const {
        data: solarEPCMData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-solar-epcm'],
        queryFn: fetchSolarEPCM,
    });
    
    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const updateMutation = useUpdateSolarEPCM();
    
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
        if (solarEPCMData) {
            setEditData({
                header: solarEPCMData.header,
                introduction: solarEPCMData.introduction,
                services: solarEPCMData.services,
                quote: solarEPCMData.quote,
                tagline: solarEPCMData.tagline,
                callToActions: solarEPCMData.callToActions,
            });
        }
    }, [solarEPCMData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (solarEPCMData) {
            setEditData({
                header: solarEPCMData.header,
                introduction: solarEPCMData.introduction,
                services: solarEPCMData.services,
                quote: solarEPCMData.quote,
                tagline: solarEPCMData.tagline,
                callToActions: solarEPCMData.callToActions,
            });
        }
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            const payload = solarEPCMData?.id 
                ? { id: solarEPCMData.id, data: editData }
                : { data: editData };
            
            await updateMutation.mutateAsync(payload);
            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'Solar EPCM Services updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating solar EPCM services:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update solar EPCM services',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle services
    const addService = () => {
        setEditData({
            ...editData,
            services: [
                ...editData.services,
                {
                    id: `service-${Date.now()}`,
                    heading: '',
                    points: [''],
                },
            ],
        });
    };

    const removeService = (index: number) => {
        const newServices = editData.services.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            services: newServices,
        });
    };

    const updateService = (index: number, field: string, value: any) => {
        const newServices = [...editData.services];
        newServices[index] = { ...newServices[index], [field]: value };
        setEditData({
            ...editData,
            services: newServices,
        });
    };

    // Handle service points
    const addServicePoint = (serviceIndex: number) => {
        const newServices = [...editData.services];
        newServices[serviceIndex].points.push('');
        setEditData({
            ...editData,
            services: newServices,
        });
    };

    const removeServicePoint = (serviceIndex: number, pointIndex: number) => {
        const newServices = [...editData.services];
        newServices[serviceIndex].points = newServices[serviceIndex].points.filter((_: any, i: number) => i !== pointIndex);
        setEditData({
            ...editData,
            services: newServices,
        });
    };

    const updateServicePoint = (serviceIndex: number, pointIndex: number, value: string) => {
        const newServices = [...editData.services];
        newServices[serviceIndex].points[pointIndex] = value;
        setEditData({
            ...editData,
            services: newServices,
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
                <div className="text-lg text-red-600">Error loading solar EPCM services</div>
            </div>
        );
    }

    if (!solarEPCMData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No solar EPCM services found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                header: {
                                    title: 'SOLAR EPCM SERVICES',
                                    subtitle: '',
                                },
                                introduction: {
                                    text: '',
                                },
                                services: [],
                                quote: {
                                    text: '',
                                    attribution: '',
                                },
                                tagline: {
                                    text: '',
                                },
                                callToActions: [],
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Solar EPCM Services
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
                    <h5 className="text-lg font-semibold dark:text-white-light">Solar EPCM Services</h5>
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
                                <div className="form-input bg-gray-100">{solarEPCMData?.header?.title}</div>
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
                                <div className="form-input bg-gray-100">{solarEPCMData?.header?.subtitle}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Introduction Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Introduction</h6>
                    <div>
                        <label className="form-label">Text</label>
                        {isEditing ? (
                            <textarea
                                className="form-textarea"
                                rows={4}
                                value={editData?.introduction?.text || ''}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        introduction: { text: e.target.value },
                                    })
                                }
                            />
                        ) : (
                            <div className="form-textarea bg-gray-100 min-h-[100px] p-3">{solarEPCMData?.introduction?.text}</div>
                        )}
                    </div>
                </div>

                {/* Services */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Services</h6>
                        {isEditing && (
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addService}>
                                <IconPlus className="h-4 w-4 mr-1" />
                                Add Service
                            </button>
                        )}
                    </div>
                    <div className="space-y-6">
                        {(isEditing ? editData?.services : solarEPCMData?.services)?.map((service: any, serviceIndex: number) => (
                            <div key={serviceIndex} className="border rounded p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-semibold">Service {serviceIndex + 1}</h6>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeService(serviceIndex)}
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
                                                value={service.id}
                                                onChange={(e) => updateService(serviceIndex, 'id', e.target.value)}
                                            />
                                        ) : (
                                            <div className="form-input bg-gray-100">{service.id}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="form-label">Heading</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={service.heading}
                                                onChange={(e) => updateService(serviceIndex, 'heading', e.target.value)}
                                            />
                                        ) : (
                                            <div className="form-input bg-gray-100">{service.heading}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Points */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="form-label">Points</label>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => addServicePoint(serviceIndex)}
                                            >
                                                <IconPlus className="h-4 w-4 mr-1" />
                                                Add Point
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {service.points?.map((point: string, pointIndex: number) => (
                                            <div key={pointIndex} className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="form-input flex-1"
                                                            value={point}
                                                            onChange={(e) => updateServicePoint(serviceIndex, pointIndex, e.target.value)}
                                                            placeholder={`Point ${pointIndex + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeServicePoint(serviceIndex, pointIndex)}
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
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{solarEPCMData?.quote?.text}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Attribution</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.quote?.attribution || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            quote: { ...editData.quote, attribution: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{solarEPCMData?.quote?.attribution || 'No attribution'}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Tagline</h6>
                    <div>
                        <label className="form-label">Text</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                value={editData?.tagline?.text || ''}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        tagline: { text: e.target.value },
                                    })
                                }
                            />
                        ) : (
                            <div className="form-input bg-gray-100">{solarEPCMData?.tagline?.text}</div>
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
                        {(isEditing ? editData?.callToActions : solarEPCMData?.callToActions)?.map((cta: any, index: number) => (
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