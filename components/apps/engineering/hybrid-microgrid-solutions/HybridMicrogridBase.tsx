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
import { useUpdateHybridMicrogrid } from './hooks/useUpdateHybridMicrogrid';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchHybridMicrogrid(): Promise<any | null> {
    try {
        const response = await fetch('/api/engineering/hybrid-microgrid-solutions');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching hybrid microgrid solutions:', error);
        throw error;
    }
}

export default function HybridMicrogridBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    
    // CTA Link Types state
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const {
        data: hybridMicrogridData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-hybrid-microgrid'],
        queryFn: fetchHybridMicrogrid,
    });
    
    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const updateMutation = useUpdateHybridMicrogrid();
    
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
        if (hybridMicrogridData) {
            setEditData({
                header: hybridMicrogridData.header,
                solutions: hybridMicrogridData.solutions,
                useCases: hybridMicrogridData.useCases,
                statement: hybridMicrogridData.statement,
                quote: hybridMicrogridData.quote,
                callToActions: hybridMicrogridData.callToActions,
            });
        }
    }, [hybridMicrogridData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (hybridMicrogridData) {
            setEditData({
                header: hybridMicrogridData.header,
                solutions: hybridMicrogridData.solutions,
                useCases: hybridMicrogridData.useCases,
                statement: hybridMicrogridData.statement,
                quote: hybridMicrogridData.quote,
                callToActions: hybridMicrogridData.callToActions,
            });
        }
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            const payload = hybridMicrogridData?.id 
                ? { id: hybridMicrogridData.id, data: editData }
                : { data: editData };
            
            await updateMutation.mutateAsync(payload);
            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'Hybrid & Microgrid Solutions updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating hybrid microgrid solutions:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update hybrid & microgrid solutions',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle solutions
    const addSolution = () => {
        setEditData({
            ...editData,
            solutions: [
                ...editData.solutions,
                {
                    id: `solution-${Date.now()}`,
                    heading: '',
                    points: [''],
                },
            ],
        });
    };

    const removeSolution = (index: number) => {
        const newSolutions = editData.solutions.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            solutions: newSolutions,
        });
    };

    const updateSolution = (index: number, field: string, value: any) => {
        const newSolutions = [...editData.solutions];
        newSolutions[index] = { ...newSolutions[index], [field]: value };
        setEditData({
            ...editData,
            solutions: newSolutions,
        });
    };

    // Handle solution points
    const addSolutionPoint = (solutionIndex: number) => {
        const newSolutions = [...editData.solutions];
        newSolutions[solutionIndex].points.push('');
        setEditData({
            ...editData,
            solutions: newSolutions,
        });
    };

    const removeSolutionPoint = (solutionIndex: number, pointIndex: number) => {
        const newSolutions = [...editData.solutions];
        newSolutions[solutionIndex].points = newSolutions[solutionIndex].points.filter((_: any, i: number) => i !== pointIndex);
        setEditData({
            ...editData,
            solutions: newSolutions,
        });
    };

    const updateSolutionPoint = (solutionIndex: number, pointIndex: number, value: string) => {
        const newSolutions = [...editData.solutions];
        newSolutions[solutionIndex].points[pointIndex] = value;
        setEditData({
            ...editData,
            solutions: newSolutions,
        });
    };

    // Handle use case items
    const addUseCaseItem = () => {
        setEditData({
            ...editData,
            useCases: {
                ...editData.useCases,
                items: [...editData.useCases.items, ''],
            },
        });
    };

    const removeUseCaseItem = (index: number) => {
        const newItems = editData.useCases.items.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            useCases: {
                ...editData.useCases,
                items: newItems,
            },
        });
    };

    const updateUseCaseItem = (index: number, value: string) => {
        const newItems = [...editData.useCases.items];
        newItems[index] = value;
        setEditData({
            ...editData,
            useCases: {
                ...editData.useCases,
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
                <div className="text-lg text-red-600">Error loading hybrid & microgrid solutions</div>
            </div>
        );
    }

    if (!hybridMicrogridData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No hybrid & microgrid solutions found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                header: {
                                    title: 'HYBRID & MICROGRID SOLUTIONS',
                                    subtitle: '',
                                    description: '',
                                },
                                solutions: [],
                                useCases: {
                                    heading: '',
                                    items: [],
                                },
                                statement: {
                                    text: '',
                                },
                                quote: {
                                    text: '',
                                    attribution: '',
                                },
                                callToActions: [],
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Hybrid & Microgrid Solutions
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
                    <h5 className="text-lg font-semibold dark:text-white-light">Hybrid & Microgrid Solutions</h5>
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
                                <div className="form-input bg-gray-100">{hybridMicrogridData?.header?.title}</div>
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
                                <div className="form-input bg-gray-100">{hybridMicrogridData?.header?.subtitle}</div>
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
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{hybridMicrogridData?.header?.description}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Solutions */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold">Solutions</h6>
                        {isEditing && (
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addSolution}>
                                <IconPlus className="h-4 w-4 mr-1" />
                                Add Solution
                            </button>
                        )}
                    </div>
                    <div className="space-y-6">
                        {(isEditing ? editData?.solutions : hybridMicrogridData?.solutions)?.map((solution: any, solutionIndex: number) => (
                            <div key={solutionIndex} className="border rounded p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-semibold">Solution {solutionIndex + 1}</h6>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeSolution(solutionIndex)}
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
                                                value={solution.id}
                                                onChange={(e) => updateSolution(solutionIndex, 'id', e.target.value)}
                                            />
                                        ) : (
                                            <div className="form-input bg-gray-100">{solution.id}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="form-label">Heading</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={solution.heading}
                                                onChange={(e) => updateSolution(solutionIndex, 'heading', e.target.value)}
                                            />
                                        ) : (
                                            <div className="form-input bg-gray-100">{solution.heading}</div>
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
                                                onClick={() => addSolutionPoint(solutionIndex)}
                                            >
                                                <IconPlus className="h-4 w-4 mr-1" />
                                                Add Point
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {solution.points?.map((point: string, pointIndex: number) => (
                                            <div key={pointIndex} className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="form-input flex-1"
                                                            value={point}
                                                            onChange={(e) => updateSolutionPoint(solutionIndex, pointIndex, e.target.value)}
                                                            placeholder={`Point ${pointIndex + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeSolutionPoint(solutionIndex, pointIndex)}
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

                {/* Use Cases */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Use Cases</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Heading</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.useCases?.heading || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            useCases: { ...editData.useCases, heading: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{hybridMicrogridData?.useCases?.heading}</div>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">Items</label>
                                {isEditing && (
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addUseCaseItem}>
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {(isEditing ? editData?.useCases?.items : hybridMicrogridData?.useCases?.items)?.map((item: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className="form-input flex-1"
                                                    value={item}
                                                    onChange={(e) => updateUseCaseItem(index, e.target.value)}
                                                    placeholder={`Use case ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeUseCaseItem(index)}
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="form-input bg-gray-100 flex-1">{item}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statement */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Statement</h6>
                    <div>
                        <label className="form-label">Text</label>
                        {isEditing ? (
                            <textarea
                                className="form-textarea"
                                rows={3}
                                value={editData?.statement?.text || ''}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        statement: { text: e.target.value },
                                    })
                                }
                            />
                        ) : (
                            <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{hybridMicrogridData?.statement?.text}</div>
                        )}
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
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{hybridMicrogridData?.quote?.text}</div>
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
                                <div className="form-input bg-gray-100">{hybridMicrogridData?.quote?.attribution || 'No attribution'}</div>
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
                        {(isEditing ? editData?.callToActions : hybridMicrogridData?.callToActions)?.map((cta: any, index: number) => (
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