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
import IconCloudDownload from '@/components/icon/icon-cloud-download';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useUpdateGridIntel } from './hooks/useUpdateGridIntel';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { navigationApi, navigationKeys } from '@/lib/api/navigation';

async function fetchGridIntel(): Promise<any | null> {
    try {
        const response = await fetch('/api/engineering/grid-intel');
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching Grid Intel:', error);
        throw error;
    }
}

export default function GridIntelBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    
    // Media Picker state
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);
    
    // CTA Link Types state
    const [ctaLinkTypes, setCtaLinkTypes] = useState<{ [key: number]: 'navigation' | 'manual' }>({});

    const {
        data: gridIntelData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['engineering-grid-intel'],
        queryFn: fetchGridIntel,
    });
    
    // Fetch navigation items for CTA links
    const { data: navigationItems } = useQuery({
        queryKey: navigationKeys.lists(),
        queryFn: () => navigationApi.getAll(),
    });

    const updateMutation = useUpdateGridIntel();
    
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
        if (gridIntelData) {
            setEditData({
                mainPage: gridIntelData.mainPage,
                productIntegration: gridIntelData.productIntegration,
                technologyStack: gridIntelData.technologyStack,
                scenarios: gridIntelData.scenarios,
                whyDifferent: gridIntelData.whyDifferent,
                whatSolves: gridIntelData.whatSolves,
                challenge: gridIntelData.challenge,
            });
        }
    }, [gridIntelData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (gridIntelData) {
            setEditData({
                mainPage: gridIntelData.mainPage,
                productIntegration: gridIntelData.productIntegration,
                technologyStack: gridIntelData.technologyStack,
                scenarios: gridIntelData.scenarios,
                whyDifferent: gridIntelData.whyDifferent,
                whatSolves: gridIntelData.whatSolves,
                challenge: gridIntelData.challenge,
            });
        }
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            const payload = gridIntelData?.id ? { id: gridIntelData.id, data: editData } : { data: editData };

            await updateMutation.mutateAsync(payload);
            setIsEditing(false);

            Swal.fire({
                title: 'Success!',
                text: 'Grid Intel updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating Grid Intel:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update Grid Intel',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Modal handlers
    const openModal = (modalType: string) => {
        setActiveModal(modalType);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    // Feature handlers for main page
    const addMainPageFeature = () => {
        setEditData({
            ...editData,
            mainPage: {
                ...editData.mainPage,
                features: [...(editData.mainPage?.features || []), { icon: { src: '', alt: '' }, text: '' }],
            },
        });
    };

    const removeMainPageFeature = (index: number) => {
        const newFeatures = editData.mainPage.features.filter((_: any, i: number) => i !== index);
        setEditData({
            ...editData,
            mainPage: {
                ...editData.mainPage,
                features: newFeatures,
            },
        });
    };

    const updateMainPageFeature = (index: number, field: string, value: any) => {
        const newFeatures = [...editData.mainPage.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setEditData({
            ...editData,
            mainPage: {
                ...editData.mainPage,
                features: newFeatures,
            },
        });
    };

    // Cloudinary upload function
    const uploadToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset');

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, section: string, field: string, index?: number, subField?: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            Swal.fire({
                title: 'Uploading...',
                text: 'Please wait while we upload your image',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const imageUrl = await uploadToCloudinary(file);

            // Update the appropriate section with the new image URL
            if (section === 'mainPage' && field === 'heroImage') {
                setEditData({
                    ...editData,
                    mainPage: {
                        ...editData.mainPage,
                        heroImage: {
                            ...editData.mainPage.heroImage,
                            src: imageUrl,
                        },
                    },
                });
            } else if (section === 'mainPage' && field === 'featureIcon' && typeof index === 'number') {
                const newFeatures = [...editData.mainPage.features];
                newFeatures[index] = {
                    ...newFeatures[index],
                    icon: {
                        ...newFeatures[index].icon,
                        src: imageUrl,
                    },
                };
                setEditData({
                    ...editData,
                    mainPage: {
                        ...editData.mainPage,
                        features: newFeatures,
                    },
                });
            } else if (section === 'productIntegration' && field === 'image') {
                setEditData({
                    ...editData,
                    productIntegration: {
                        ...editData.productIntegration,
                        image: {
                            ...editData.productIntegration.image,
                            src: imageUrl,
                        },
                    },
                });
            } else if (section === 'technologyStack' && field === 'image') {
                setEditData({
                    ...editData,
                    technologyStack: {
                        ...editData.technologyStack,
                        image: {
                            ...editData.technologyStack.image,
                            src: imageUrl,
                        },
                    },
                });
            } else if (section === 'scenarios' && field === 'image') {
                setEditData({
                    ...editData,
                    scenarios: {
                        ...editData.scenarios,
                        image: {
                            ...editData.scenarios.image,
                            src: imageUrl,
                        },
                    },
                });
            } else if (section === 'challenge' && field === 'image') {
                setEditData({
                    ...editData,
                    challenge: {
                        ...editData.challenge,
                        image: {
                            ...editData.challenge.image,
                            src: imageUrl,
                        },
                    },
                });
            }

            Swal.close();
            Swal.fire({
                title: 'Success!',
                text: 'Image uploaded successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: 'Error!',
                text: 'Failed to upload image',
                icon: 'error',
            });
        }
    };

    // Media Picker handlers
    const openMediaPicker = (target: string) => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (url: string, file?: any) => {
        if (!mediaPickerTarget) return;

        // Handle different image targets
        if (mediaPickerTarget === 'heroImage') {
            setEditData({
                ...editData,
                mainPage: {
                    ...editData.mainPage,
                    heroImage: {
                        ...editData.mainPage.heroImage,
                        src: url,
                    },
                },
            });
        } else if (mediaPickerTarget === 'productIntegration') {
            setEditData({
                ...editData,
                productIntegration: {
                    ...editData.productIntegration,
                    image: {
                        ...editData.productIntegration.image,
                        src: url,
                    },
                },
            });
        } else if (mediaPickerTarget === 'technologyStack') {
            setEditData({
                ...editData,
                technologyStack: {
                    ...editData.technologyStack,
                    image: {
                        ...editData.technologyStack.image,
                        src: url,
                    },
                },
            });
        } else if (mediaPickerTarget === 'scenarios') {
            setEditData({
                ...editData,
                scenarios: {
                    ...editData.scenarios,
                    image: {
                        ...editData.scenarios.image,
                        src: url,
                    },
                },
            });
        } else if (mediaPickerTarget === 'challenge') {
            setEditData({
                ...editData,
                challenge: {
                    ...editData.challenge,
                    image: {
                        ...editData.challenge.image,
                        src: url,
                    },
                },
            });
        }

        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading Grid Intel</div>
            </div>
        );
    }

    if (!gridIntelData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No Grid Intel found</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                mainPage: {
                                    title: 'GRID-INTEL',
                                    subtitle: 'The Intelligence Layer Powering Energy Systems with Precision and Foresight',
                                    description:
                                        'GRID-INTEL™ is a proprietary platform that monitors, balances, and predicts energy flows across solar, battery, diesel, and grid infrastructure — in real time.',
                                    heroImage: { src: '', alt: '' },
                                    tagline: '',
                                    features: [],
                                    energyIntelligencePlatform: {
                                        title: 'Energy Intelligence Platform',
                                        features: [
                                            'Multi-source energy optimization',
                                            'Remote telemetry & command',
                                            'Load prediction & performance analytics',
                                            'Zero-blackout logic & fault anticipation',
                                        ],
                                    },
                                    energyYouCanCountOn: {
                                        title: 'Energy You Can Count On',
                                        subtitle: "— Even When the Grid Can't Be Counted On",
                                        description:
                                            'We deliver power infrastructure that anticipates failures, absorbs shocks, and ensures continuity — across any terrain, in any nation, under any grid condition',
                                    },
                                    builtForIntelligence: {
                                        title: 'Built for Intelligence.',
                                        subtitle: 'Backed by Discipline.',
                                        runSmarter: 'Run Smarter.',
                                        operateWithConfidence: 'Operate with Confidence.',
                                        scaleWithoutUncertainty: 'Scale Without Uncertainty.',
                                    },
                                    ctaButtons: [
                                        {
                                            text: 'Schedule a Technical Deep-Dive',
                                            href: '/contact',
                                            icon: '→',
                                        },
                                        {
                                            text: 'Engage Our System Architecture Team',
                                            href: '/architecture',
                                            icon: '→',
                                        },
                                        {
                                            text: 'Download the GRID-INTEL™ Product Dossier',
                                            href: '/downloads/grid-intel-dossier.pdf',
                                            icon: '↓',
                                        },
                                    ],
                                },
                                productIntegration: {
                                    title: 'Product Integration',
                                    subtitle: 'GRID-INTEL™ is fully integrated with.',
                                    description: '',
                                    image: { src: '', alt: '' },
                                    items: [],
                                    tagline: 'GRID-INTEL™ turns distributed power systems into orchestrated, intelligent infrastructure.',
                                },
                                technologyStack: {
                                    title: 'Technology Stack Overview',
                                    subtitle: 'GRID-INTEL™ Includes:',
                                    description: '',
                                    image: { src: '', alt: '' },
                                    features: [],
                                },
                                scenarios: {
                                    title: 'Built for These Scenarios',
                                    subtitle: 'Where GRID-INTEL™ is Already Running',
                                    description: '',
                                    image: { src: '', alt: '' },
                                    scenarios: [],
                                    tagline: 'GRID-INTEL™ is Deployed Where Energy Failure Is Unacceptable — And Intelligence Is Essential.',
                                },
                                whyDifferent: {
                                    title: 'Why GRID-INTEL™ - Is Different',
                                    subtitle: '',
                                    description: '',
                                    comparisonTable: [],
                                },
                                whatSolves: {
                                    title: 'What GRID-INTEL™ Solves',
                                    subtitle: 'GRID-INTEL™ Is Built to Solve This — With Embedded Intelligence.',
                                    description: '',
                                    solutions: [],
                                    tagline: 'GRID-INTEL™ turns distributed power systems into orchestrated, intelligent infrastructure.',
                                },
                                challenge: {
                                    title: 'The Challenge',
                                    subtitle: 'Energy Systems Are Being Installed Without Intelligence',
                                    description: 'Across emerging markets and decentralized energy deployments, key problems persist:',
                                    image: { src: '', alt: '' },
                                    challenges: [],
                                    resultText: 'The Result: Energy Loss, Operational Downtime, And High Cost Of Ownership.',
                                },
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Grid Intel
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
                    <h5 className="text-lg font-semibold dark:text-white-light">Grid Intel</h5>
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
                {/* Main Page Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Main Page</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.mainPage?.title || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            mainPage: { ...editData.mainPage, title: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.title}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Subtitle</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    value={editData?.mainPage?.subtitle || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            mainPage: { ...editData.mainPage, subtitle: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[60px] p-3">{gridIntelData?.mainPage?.subtitle}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={editData?.mainPage?.description || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            mainPage: { ...editData.mainPage, description: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{gridIntelData?.mainPage?.description}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Tagline</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.mainPage?.tagline || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            mainPage: { ...editData.mainPage, tagline: e.target.value },
                                        })
                                    }
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.tagline}</div>
                            )}
                        </div>

                        {/* Hero Image */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label">Hero Image Source</label>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => openMediaPicker('heroImage')}
                                                className="btn btn-outline-primary btn-sm w-full"
                                            >
                                                Browse Media
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mainPage', 'heroImage')} className="hidden" id="hero-image-upload" />
                                                <label htmlFor="hero-image-upload" className="btn btn-outline-primary btn-sm cursor-pointer">
                                                    <IconCloudDownload className="h-4 w-4 mr-1" />
                                                    Upload Image
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.mainPage?.heroImage?.src || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        mainPage: {
                                                            ...editData.mainPage,
                                                            heroImage: { ...editData.mainPage.heroImage, src: e.target.value },
                                                        },
                                                    })
                                                }
                                                placeholder="Or paste URL manually"
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.heroImage?.src || 'No image'}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Hero Image Alt Text</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.heroImage?.alt || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        heroImage: { ...editData.mainPage.heroImage, alt: e.target.value },
                                                    },
                                                })
                                            }
                                            placeholder="Alt text"
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.heroImage?.alt || 'No alt text'}</div>
                                    )}
                                </div>
                            </div>

                            {/* Image Preview */}
                            {editData?.mainPage?.heroImage?.src && (
                                <div className="mt-3">
                                    <label className="form-label">Image Preview</label>
                                    <div className="border rounded-lg p-2 bg-gray-50">
                                        <img
                                            src={editData.mainPage.heroImage.src}
                                            alt={editData.mainPage.heroImage.alt || 'Hero Image Preview'}
                                            className="max-w-full h-32 object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.src = '/assets/images/placeholder.jpg';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Energy Intelligence Platform */}
                        <div>
                            <h6 className="text-md font-semibold mb-3">Energy Intelligence Platform</h6>
                            <div>
                                <label className="form-label">Title</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editData?.mainPage?.energyIntelligencePlatform?.title || ''}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                mainPage: {
                                                    ...editData.mainPage,
                                                    energyIntelligencePlatform: {
                                                        ...editData.mainPage.energyIntelligencePlatform,
                                                        title: e.target.value,
                                                    },
                                                },
                                            })
                                        }
                                    />
                                ) : (
                                    <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.energyIntelligencePlatform?.title}</div>
                                )}
                            </div>
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="form-label">Features</label>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => {
                                                const newFeatures = [...(editData.mainPage?.energyIntelligencePlatform?.features || []), ''];
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        energyIntelligencePlatform: {
                                                            ...editData.mainPage.energyIntelligencePlatform,
                                                            features: newFeatures,
                                                        },
                                                    },
                                                });
                                            }}
                                        >
                                            <IconPlus className="h-4 w-4 mr-1" />
                                            Add Feature
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {(isEditing ? editData?.mainPage?.energyIntelligencePlatform?.features : gridIntelData?.mainPage?.energyIntelligencePlatform?.features)?.map(
                                        (feature: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="form-input flex-1"
                                                            value={feature}
                                                            onChange={(e) => {
                                                                const newFeatures = [...editData.mainPage.energyIntelligencePlatform.features];
                                                                newFeatures[index] = e.target.value;
                                                                setEditData({
                                                                    ...editData,
                                                                    mainPage: {
                                                                        ...editData.mainPage,
                                                                        energyIntelligencePlatform: {
                                                                            ...editData.mainPage.energyIntelligencePlatform,
                                                                            features: newFeatures,
                                                                        },
                                                                    },
                                                                });
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => {
                                                                const newFeatures = editData.mainPage.energyIntelligencePlatform.features.filter((_: string, i: number) => i !== index);
                                                                setEditData({
                                                                    ...editData,
                                                                    mainPage: {
                                                                        ...editData.mainPage,
                                                                        energyIntelligencePlatform: {
                                                                            ...editData.mainPage.energyIntelligencePlatform,
                                                                            features: newFeatures,
                                                                        },
                                                                    },
                                                                });
                                                            }}
                                                        >
                                                            <IconTrash className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="form-input bg-gray-100 flex-1">{feature}</div>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Energy You Can Count On */}
                        <div>
                            <h6 className="text-md font-semibold mb-3">Energy You Can Count On</h6>
                            <div className="space-y-3">
                                <div>
                                    <label className="form-label">Title</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.energyYouCanCountOn?.title || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        energyYouCanCountOn: {
                                                            ...editData.mainPage.energyYouCanCountOn,
                                                            title: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.energyYouCanCountOn?.title}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Subtitle</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.energyYouCanCountOn?.subtitle || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        energyYouCanCountOn: {
                                                            ...editData.mainPage.energyYouCanCountOn,
                                                            subtitle: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.energyYouCanCountOn?.subtitle}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Description</label>
                                    {isEditing ? (
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            value={editData?.mainPage?.energyYouCanCountOn?.description || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        energyYouCanCountOn: {
                                                            ...editData.mainPage.energyYouCanCountOn,
                                                            description: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-textarea bg-gray-100 min-h-[80px] p-3">{gridIntelData?.mainPage?.energyYouCanCountOn?.description}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Built for Intelligence */}
                        <div>
                            <h6 className="text-md font-semibold mb-3">Built for Intelligence</h6>
                            <div className="space-y-3">
                                <div>
                                    <label className="form-label">Title</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.builtForIntelligence?.title || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        builtForIntelligence: {
                                                            ...editData.mainPage.builtForIntelligence,
                                                            title: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.builtForIntelligence?.title}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Subtitle</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.builtForIntelligence?.subtitle || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        builtForIntelligence: {
                                                            ...editData.mainPage.builtForIntelligence,
                                                            subtitle: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.builtForIntelligence?.subtitle}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Run Smarter</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.builtForIntelligence?.runSmarter || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        builtForIntelligence: {
                                                            ...editData.mainPage.builtForIntelligence,
                                                            runSmarter: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.builtForIntelligence?.runSmarter}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Operate with Confidence</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.builtForIntelligence?.operateWithConfidence || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        builtForIntelligence: {
                                                            ...editData.mainPage.builtForIntelligence,
                                                            operateWithConfidence: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.builtForIntelligence?.operateWithConfidence}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Scale Without Uncertainty</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editData?.mainPage?.builtForIntelligence?.scaleWithoutUncertainty || ''}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    mainPage: {
                                                        ...editData.mainPage,
                                                        builtForIntelligence: {
                                                            ...editData.mainPage.builtForIntelligence,
                                                            scaleWithoutUncertainty: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                        />
                                    ) : (
                                        <div className="form-input bg-gray-100">{gridIntelData?.mainPage?.builtForIntelligence?.scaleWithoutUncertainty}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">CTA Buttons</label>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                            const newCTAs = [...(editData.mainPage?.ctaButtons || []), { text: '', href: '', icon: '' }];
                                            setEditData({
                                                ...editData,
                                                mainPage: {
                                                    ...editData.mainPage,
                                                    ctaButtons: newCTAs,
                                                },
                                            });
                                        }}
                                    >
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add CTA Button
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {(isEditing ? editData?.mainPage?.ctaButtons : gridIntelData?.mainPage?.ctaButtons)?.map((cta: any, index: number) => (
                                    <div key={index} className="border rounded p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-medium">CTA Button {index + 1}</h6>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => {
                                                        const newCTAs = editData.mainPage.ctaButtons.filter((_: any, i: number) => i !== index);
                                                        setEditData({
                                                            ...editData,
                                                            mainPage: {
                                                                ...editData.mainPage,
                                                                ctaButtons: newCTAs,
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="form-label text-sm">Button Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={cta.text}
                                                        onChange={(e) => {
                                                            const newCTAs = [...editData.mainPage.ctaButtons];
                                                            newCTAs[index] = { ...newCTAs[index], text: e.target.value };
                                                            setEditData({
                                                                ...editData,
                                                                mainPage: {
                                                                    ...editData.mainPage,
                                                                    ctaButtons: newCTAs,
                                                                },
                                                            });
                                                        }}
                                                        placeholder="Button text"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Link URL</label>
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
                                                                value={cta.href}
                                                                onChange={(e) => {
                                                                    const newCTAs = [...editData.mainPage.ctaButtons];
                                                                    newCTAs[index] = { ...newCTAs[index], href: e.target.value };
                                                                    setEditData({
                                                                        ...editData,
                                                                        mainPage: {
                                                                            ...editData.mainPage,
                                                                            ctaButtons: newCTAs,
                                                                        },
                                                                    });
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
                                                                value={cta.href}
                                                                onChange={(e) => {
                                                                    const newCTAs = [...editData.mainPage.ctaButtons];
                                                                    newCTAs[index] = { ...newCTAs[index], href: e.target.value };
                                                                    setEditData({
                                                                        ...editData,
                                                                        mainPage: {
                                                                            ...editData.mainPage,
                                                                            ctaButtons: newCTAs,
                                                                        },
                                                                    });
                                                                }}
                                                                placeholder="https://example.com or /path"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Icon (optional)</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={cta.icon || ''}
                                                        onChange={(e) => {
                                                            const newCTAs = [...editData.mainPage.ctaButtons];
                                                            newCTAs[index] = { ...newCTAs[index], icon: e.target.value };
                                                            setEditData({
                                                                ...editData,
                                                                mainPage: {
                                                                    ...editData.mainPage,
                                                                    ctaButtons: newCTAs,
                                                                },
                                                            });
                                                        }}
                                                        placeholder="→ or ↓ or any icon"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="form-label text-sm">Button Text</label>
                                                    <div className="form-input bg-gray-100">{cta.text}</div>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Link URL</label>
                                                    <div className="form-input bg-gray-100">{cta.href}</div>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Icon</label>
                                                    <div className="form-input bg-gray-100">{cta.icon || 'No icon'}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">Hero Features</label>
                                {isEditing && (
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addMainPageFeature}>
                                        <IconPlus className="h-4 w-4 mr-1" />
                                        Add Feature
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {(isEditing ? editData?.mainPage?.features : gridIntelData?.mainPage?.features)?.map((feature: any, index: number) => (
                                    <div key={index} className="border rounded p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-medium">Feature {index + 1}</h6>
                                            {isEditing && (
                                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeMainPageFeature(index)}>
                                                    <IconTrash className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="form-label text-sm">Icon Image</label>
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={feature.icon?.src || ''}
                                                                onChange={(e) => updateMainPageFeature(index, 'icon', { ...feature.icon, src: e.target.value })}
                                                                placeholder="Image URL or upload below"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageUpload(e, 'mainPage', 'featureIcon', index)}
                                                                    className="hidden"
                                                                    id={`feature-icon-upload-${index}`}
                                                                />
                                                                <label htmlFor={`feature-icon-upload-${index}`} className="btn btn-outline-primary btn-sm cursor-pointer">
                                                                    <IconCloudDownload className="h-4 w-4 mr-1" />
                                                                    Upload Icon
                                                                </label>
                                                                <span className="text-xs text-gray-500">or paste URL above</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="form-label text-sm">Icon Alt Text</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={feature.icon?.alt || ''}
                                                            onChange={(e) => updateMainPageFeature(index, 'icon', { ...feature.icon, alt: e.target.value })}
                                                            placeholder="Alt text for icon"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Icon Preview */}
                                                {feature.icon?.src && (
                                                    <div>
                                                        <label className="form-label text-sm">Icon Preview</label>
                                                        <div className="border rounded p-2 bg-gray-50 inline-block">
                                                            <img
                                                                src={feature.icon.src}
                                                                alt={feature.icon.alt || 'Icon Preview'}
                                                                className="w-8 h-8 object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="form-label text-sm">Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={feature.text}
                                                        onChange={(e) => updateMainPageFeature(index, 'text', e.target.value)}
                                                        placeholder="Feature text"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="form-label text-sm">Icon Image URL</label>
                                                        <div className="form-input bg-gray-100">{feature.icon?.src || 'No image'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="form-label text-sm">Icon Alt Text</label>
                                                        <div className="form-input bg-gray-100">{feature.icon?.alt || 'No alt text'}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm">Text</label>
                                                    <div className="form-input bg-gray-100">{feature.text}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Buttons */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Modals</h6>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <button type="button" className="btn btn-outline-info" onClick={() => openModal('productIntegration')}>
                            Product Integration
                        </button>
                        <button type="button" className="btn btn-outline-info" onClick={() => openModal('technologyStack')}>
                            Technology Stack
                        </button>
                        <button type="button" className="btn btn-outline-info" onClick={() => openModal('scenarios')}>
                            Built for Scenarios
                        </button>
                        <button type="button" className="btn btn-outline-info" onClick={() => openModal('whyDifferent')}>
                            Why Different
                        </button>
                        <button type="button" className="btn btn-outline-info" onClick={() => openModal('whatSolves')}>
                            What Solves
                        </button>
                        <button type="button" className="btn btn-outline-info" onClick={() => openModal('challenge')}>
                            The Challenge
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {activeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold">
                                    {activeModal === 'productIntegration' && 'Product Integration'}
                                    {activeModal === 'technologyStack' && 'Technology Stack Overview'}
                                    {activeModal === 'scenarios' && 'Built for These Scenarios'}
                                    {activeModal === 'whyDifferent' && 'Why GRID-INTEL™ is Different'}
                                    {activeModal === 'whatSolves' && 'What GRID-INTEL™ Solves'}
                                    {activeModal === 'challenge' && 'The Challenge'}
                                </h3>
                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={closeModal}>
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="space-y-6">
                                {/* Product Integration Modal */}
                                {activeModal === 'productIntegration' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.productIntegration?.title || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        productIntegration: { ...editData.productIntegration, title: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Subtitle</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.productIntegration?.subtitle || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        productIntegration: { ...editData.productIntegration, subtitle: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                value={editData?.productIntegration?.description || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        productIntegration: { ...editData.productIntegration, description: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Tagline</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.productIntegration?.tagline || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        productIntegration: { ...editData.productIntegration, tagline: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {/* Image Section */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="form-label">Image Source</label>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openMediaPicker('productIntegration')}
                                                                className="btn btn-outline-primary btn-sm w-full"
                                                            >
                                                                Browse Media
                                                            </button>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageUpload(e, 'productIntegration', 'image')}
                                                                    className="hidden"
                                                                    id="product-integration-image-upload"
                                                                />
                                                                <label htmlFor="product-integration-image-upload" className="btn btn-outline-primary btn-sm cursor-pointer">
                                                                    <IconCloudDownload className="h-4 w-4 mr-1" />
                                                                    Upload Image
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={editData?.productIntegration?.image?.src || ''}
                                                                onChange={(e) =>
                                                                    setEditData({
                                                                        ...editData,
                                                                        productIntegration: {
                                                                            ...editData.productIntegration,
                                                                            image: { ...editData.productIntegration.image, src: e.target.value },
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="Or paste URL manually"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="form-input bg-gray-100">{editData?.productIntegration?.image?.src || 'No image'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="form-label">Image Alt Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editData?.productIntegration?.image?.alt || ''}
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                productIntegration: {
                                                                    ...editData.productIntegration,
                                                                    image: { ...editData.productIntegration.image, alt: e.target.value },
                                                                },
                                                            })
                                                        }
                                                        placeholder="Alt text"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Preview */}
                                            {editData?.productIntegration?.image?.src && (
                                                <div className="mt-3">
                                                    <label className="form-label">Image Preview</label>
                                                    <div className="border rounded-lg p-2 bg-gray-50">
                                                        <img
                                                            src={editData.productIntegration.image.src}
                                                            alt={editData.productIntegration.image.alt || 'Product Integration Preview'}
                                                            className="max-w-full h-32 object-cover rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Items Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="form-label">Integration Items</label>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const newItems = [...(editData.productIntegration?.items || []), { icon: { src: '', alt: '' }, title: '', description: '' }];
                                                            setEditData({
                                                                ...editData,
                                                                productIntegration: { ...editData.productIntegration, items: newItems },
                                                            });
                                                        }}
                                                    >
                                                        <IconPlus className="h-4 w-4 mr-1" />
                                                        Add Item
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(editData?.productIntegration?.items || []).map((item: any, index: number) => (
                                                    <div key={index} className="border rounded p-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h6 className="font-medium">Item {index + 1}</h6>
                                                            {isEditing && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => {
                                                                        const newItems = editData.productIntegration.items.filter((_: any, i: number) => i !== index);
                                                                        setEditData({
                                                                            ...editData,
                                                                            productIntegration: { ...editData.productIntegration, items: newItems },
                                                                        });
                                                                    }}
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="form-label text-sm">Title</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={item.title || ''}
                                                                    onChange={(e) => {
                                                                        const newItems = [...editData.productIntegration.items];
                                                                        newItems[index] = { ...newItems[index], title: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            productIntegration: { ...editData.productIntegration, items: newItems },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="form-label text-sm">Description</label>
                                                                <textarea
                                                                    className="form-textarea"
                                                                    rows={2}
                                                                    value={item.description || ''}
                                                                    onChange={(e) => {
                                                                        const newItems = [...editData.productIntegration.items];
                                                                        newItems[index] = { ...newItems[index], description: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            productIntegration: { ...editData.productIntegration, items: newItems },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Technology Stack Modal */}
                                {activeModal === 'technologyStack' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.technologyStack?.title || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        technologyStack: { ...editData.technologyStack, title: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Subtitle</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.technologyStack?.subtitle || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        technologyStack: { ...editData.technologyStack, subtitle: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                value={editData?.technologyStack?.description || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        technologyStack: { ...editData.technologyStack, description: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {/* Image Section */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="form-label">Image Source</label>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openMediaPicker('technologyStack')}
                                                                className="btn btn-outline-primary btn-sm w-full"
                                                            >
                                                                Browse Media
                                                            </button>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageUpload(e, 'technologyStack', 'image')}
                                                                    className="hidden"
                                                                    id="technology-stack-image-upload"
                                                                />
                                                                <label htmlFor="technology-stack-image-upload" className="btn btn-outline-primary btn-sm cursor-pointer">
                                                                    <IconCloudDownload className="h-4 w-4 mr-1" />
                                                                    Upload Image
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={editData?.technologyStack?.image?.src || ''}
                                                                onChange={(e) =>
                                                                    setEditData({
                                                                        ...editData,
                                                                        technologyStack: {
                                                                            ...editData.technologyStack,
                                                                            image: { ...editData.technologyStack.image, src: e.target.value },
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="Or paste URL manually"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="form-input bg-gray-100">{editData?.technologyStack?.image?.src || 'No image'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="form-label">Image Alt Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editData?.technologyStack?.image?.alt || ''}
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                technologyStack: {
                                                                    ...editData.technologyStack,
                                                                    image: { ...editData.technologyStack.image, alt: e.target.value },
                                                                },
                                                            })
                                                        }
                                                        placeholder="Alt text"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Preview */}
                                            {editData?.technologyStack?.image?.src && (
                                                <div className="mt-3">
                                                    <label className="form-label">Image Preview</label>
                                                    <div className="border rounded-lg p-2 bg-gray-50">
                                                        <img
                                                            src={editData.technologyStack.image.src}
                                                            alt={editData.technologyStack.image.alt || 'Technology Stack Preview'}
                                                            className="max-w-full h-32 object-cover rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Features Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="form-label">Technology Features</label>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const newFeatures = [...(editData.technologyStack?.features || []), { icon: { src: '', alt: '' }, text: '' }];
                                                            setEditData({
                                                                ...editData,
                                                                technologyStack: { ...editData.technologyStack, features: newFeatures },
                                                            });
                                                        }}
                                                    >
                                                        <IconPlus className="h-4 w-4 mr-1" />
                                                        Add Feature
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(editData?.technologyStack?.features || []).map((feature: any, index: number) => (
                                                    <div key={index} className="border rounded p-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h6 className="font-medium">Feature {index + 1}</h6>
                                                            {isEditing && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => {
                                                                        const newFeatures = editData.technologyStack.features.filter((_: any, i: number) => i !== index);
                                                                        setEditData({
                                                                            ...editData,
                                                                            technologyStack: { ...editData.technologyStack, features: newFeatures },
                                                                        });
                                                                    }}
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="form-label text-sm">Text</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={feature.text || ''}
                                                                    onChange={(e) => {
                                                                        const newFeatures = [...editData.technologyStack.features];
                                                                        newFeatures[index] = { ...newFeatures[index], text: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            technologyStack: { ...editData.technologyStack, features: newFeatures },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Scenarios Modal */}
                                {activeModal === 'scenarios' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.scenarios?.title || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        scenarios: { ...editData.scenarios, title: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Subtitle</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.scenarios?.subtitle || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        scenarios: { ...editData.scenarios, subtitle: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                value={editData?.scenarios?.description || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        scenarios: { ...editData.scenarios, description: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Tagline</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.scenarios?.tagline || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        scenarios: { ...editData.scenarios, tagline: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {/* Image Section */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="form-label">Image Source</label>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openMediaPicker('scenarios')}
                                                                className="btn btn-outline-primary btn-sm w-full"
                                                            >
                                                                Browse Media
                                                            </button>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageUpload(e, 'scenarios', 'image')}
                                                                    className="hidden"
                                                                    id="scenarios-image-upload"
                                                                />
                                                                <label htmlFor="scenarios-image-upload" className="btn btn-outline-primary btn-sm cursor-pointer">
                                                                    <IconCloudDownload className="h-4 w-4 mr-1" />
                                                                    Upload Image
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={editData?.scenarios?.image?.src || ''}
                                                                onChange={(e) =>
                                                                    setEditData({
                                                                        ...editData,
                                                                        scenarios: {
                                                                            ...editData.scenarios,
                                                                            image: { ...editData.scenarios.image, src: e.target.value },
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="Or paste URL manually"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="form-input bg-gray-100">{editData?.scenarios?.image?.src || 'No image'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="form-label">Image Alt Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editData?.scenarios?.image?.alt || ''}
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                scenarios: {
                                                                    ...editData.scenarios,
                                                                    image: { ...editData.scenarios.image, alt: e.target.value },
                                                                },
                                                            })
                                                        }
                                                        placeholder="Alt text"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Preview */}
                                            {editData?.scenarios?.image?.src && (
                                                <div className="mt-3">
                                                    <label className="form-label">Image Preview</label>
                                                    <div className="border rounded-lg p-2 bg-gray-50">
                                                        <img
                                                            src={editData.scenarios.image.src}
                                                            alt={editData.scenarios.image.alt || 'Scenarios Preview'}
                                                            className="max-w-full h-32 object-cover rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Scenarios Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="form-label">Scenario Items</label>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const newScenarios = [...(editData.scenarios?.scenarios || []), { icon: { src: '', alt: '' }, text: '' }];
                                                            setEditData({
                                                                ...editData,
                                                                scenarios: { ...editData.scenarios, scenarios: newScenarios },
                                                            });
                                                        }}
                                                    >
                                                        <IconPlus className="h-4 w-4 mr-1" />
                                                        Add Scenario
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(editData?.scenarios?.scenarios || []).map((scenario: any, index: number) => (
                                                    <div key={index} className="border rounded p-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h6 className="font-medium">Scenario {index + 1}</h6>
                                                            {isEditing && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => {
                                                                        const newScenarios = editData.scenarios.scenarios.filter((_: any, i: number) => i !== index);
                                                                        setEditData({
                                                                            ...editData,
                                                                            scenarios: { ...editData.scenarios, scenarios: newScenarios },
                                                                        });
                                                                    }}
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="form-label text-sm">Text</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={scenario.text || ''}
                                                                    onChange={(e) => {
                                                                        const newScenarios = [...editData.scenarios.scenarios];
                                                                        newScenarios[index] = { ...newScenarios[index], text: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            scenarios: { ...editData.scenarios, scenarios: newScenarios },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Why Different Modal */}
                                {activeModal === 'whyDifferent' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.whyDifferent?.title || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        whyDifferent: { ...editData.whyDifferent, title: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Subtitle</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.whyDifferent?.subtitle || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        whyDifferent: { ...editData.whyDifferent, subtitle: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                value={editData?.whyDifferent?.description || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        whyDifferent: { ...editData.whyDifferent, description: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {/* Comparison Table Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="form-label">Comparison Table</label>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const newComparisons = [...(editData.whyDifferent?.comparisonTable || []), { feature: '', gridIntel: '', conventional: '' }];
                                                            setEditData({
                                                                ...editData,
                                                                whyDifferent: { ...editData.whyDifferent, comparisonTable: newComparisons },
                                                            });
                                                        }}
                                                    >
                                                        <IconPlus className="h-4 w-4 mr-1" />
                                                        Add Comparison
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(editData?.whyDifferent?.comparisonTable || []).map((comparison: any, index: number) => (
                                                    <div key={index} className="border rounded p-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h6 className="font-medium">Comparison {index + 1}</h6>
                                                            {isEditing && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => {
                                                                        const newComparisons = editData.whyDifferent.comparisonTable.filter((_: any, i: number) => i !== index);
                                                                        setEditData({
                                                                            ...editData,
                                                                            whyDifferent: { ...editData.whyDifferent, comparisonTable: newComparisons },
                                                                        });
                                                                    }}
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="form-label text-sm">Feature</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={comparison.feature || ''}
                                                                    onChange={(e) => {
                                                                        const newComparisons = [...editData.whyDifferent.comparisonTable];
                                                                        newComparisons[index] = { ...newComparisons[index], feature: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            whyDifferent: { ...editData.whyDifferent, comparisonTable: newComparisons },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="form-label text-sm">GRID-INTEL™</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={comparison.gridIntel || ''}
                                                                    onChange={(e) => {
                                                                        const newComparisons = [...editData.whyDifferent.comparisonTable];
                                                                        newComparisons[index] = { ...newComparisons[index], gridIntel: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            whyDifferent: { ...editData.whyDifferent, comparisonTable: newComparisons },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="form-label text-sm">Conventional Controllers</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={comparison.conventional || ''}
                                                                    onChange={(e) => {
                                                                        const newComparisons = [...editData.whyDifferent.comparisonTable];
                                                                        newComparisons[index] = { ...newComparisons[index], conventional: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            whyDifferent: { ...editData.whyDifferent, comparisonTable: newComparisons },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* What Solves Modal */}
                                {activeModal === 'whatSolves' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.whatSolves?.title || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        whatSolves: { ...editData.whatSolves, title: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Subtitle</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.whatSolves?.subtitle || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        whatSolves: { ...editData.whatSolves, subtitle: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                value={editData?.whatSolves?.description || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        whatSolves: { ...editData.whatSolves, description: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Tagline</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.whatSolves?.tagline || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        whatSolves: { ...editData.whatSolves, tagline: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {/* Solutions Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="form-label">Solutions</label>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const newSolutions = [...(editData.whatSolves?.solutions || []), { icon: { src: '', alt: '' }, title: '', description: '' }];
                                                            setEditData({
                                                                ...editData,
                                                                whatSolves: { ...editData.whatSolves, solutions: newSolutions },
                                                            });
                                                        }}
                                                    >
                                                        <IconPlus className="h-4 w-4 mr-1" />
                                                        Add Solution
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(editData?.whatSolves?.solutions || []).map((solution: any, index: number) => (
                                                    <div key={index} className="border rounded p-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h6 className="font-medium">Solution {index + 1}</h6>
                                                            {isEditing && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => {
                                                                        const newSolutions = editData.whatSolves.solutions.filter((_: any, i: number) => i !== index);
                                                                        setEditData({
                                                                            ...editData,
                                                                            whatSolves: { ...editData.whatSolves, solutions: newSolutions },
                                                                        });
                                                                    }}
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="form-label text-sm">Title</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={solution.title || ''}
                                                                    onChange={(e) => {
                                                                        const newSolutions = [...editData.whatSolves.solutions];
                                                                        newSolutions[index] = { ...newSolutions[index], title: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            whatSolves: { ...editData.whatSolves, solutions: newSolutions },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="form-label text-sm">Description</label>
                                                                <textarea
                                                                    className="form-textarea"
                                                                    rows={2}
                                                                    value={solution.description || ''}
                                                                    onChange={(e) => {
                                                                        const newSolutions = [...editData.whatSolves.solutions];
                                                                        newSolutions[index] = { ...newSolutions[index], description: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            whatSolves: { ...editData.whatSolves, solutions: newSolutions },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Challenge Modal */}
                                {activeModal === 'challenge' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.challenge?.title || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        challenge: { ...editData.challenge, title: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Subtitle</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.challenge?.subtitle || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        challenge: { ...editData.challenge, subtitle: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={3}
                                                value={editData?.challenge?.description || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        challenge: { ...editData.challenge, description: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Result Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.challenge?.resultText || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        challenge: { ...editData.challenge, resultText: e.target.value },
                                                    })
                                                }
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {/* Image Section */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="form-label">Image Source</label>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openMediaPicker('challenge')}
                                                                className="btn btn-outline-primary btn-sm w-full"
                                                            >
                                                                Browse Media
                                                            </button>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageUpload(e, 'challenge', 'image')}
                                                                    className="hidden"
                                                                    id="challenge-image-upload"
                                                                />
                                                                <label htmlFor="challenge-image-upload" className="btn btn-outline-primary btn-sm cursor-pointer">
                                                                    <IconCloudDownload className="h-4 w-4 mr-1" />
                                                                    Upload Image
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={editData?.challenge?.image?.src || ''}
                                                                onChange={(e) =>
                                                                    setEditData({
                                                                        ...editData,
                                                                        challenge: {
                                                                            ...editData.challenge,
                                                                            image: { ...editData.challenge.image, src: e.target.value },
                                                                        },
                                                                    })
                                                                }
                                                                placeholder="Or paste URL manually"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="form-input bg-gray-100">{editData?.challenge?.image?.src || 'No image'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="form-label">Image Alt Text</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editData?.challenge?.image?.alt || ''}
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                challenge: {
                                                                    ...editData.challenge,
                                                                    image: { ...editData.challenge.image, alt: e.target.value },
                                                                },
                                                            })
                                                        }
                                                        placeholder="Alt text"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Preview */}
                                            {editData?.challenge?.image?.src && (
                                                <div className="mt-3">
                                                    <label className="form-label">Image Preview</label>
                                                    <div className="border rounded-lg p-2 bg-gray-50">
                                                        <img
                                                            src={editData.challenge.image.src}
                                                            alt={editData.challenge.image.alt || 'Challenge Preview'}
                                                            className="max-w-full h-32 object-cover rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/assets/images/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Challenges Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="form-label">Challenge Items</label>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const newChallenges = [...(editData.challenge?.challenges || []), { icon: { src: '', alt: '' }, text: '' }];
                                                            setEditData({
                                                                ...editData,
                                                                challenge: { ...editData.challenge, challenges: newChallenges },
                                                            });
                                                        }}
                                                    >
                                                        <IconPlus className="h-4 w-4 mr-1" />
                                                        Add Challenge
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {(editData?.challenge?.challenges || []).map((challenge: any, index: number) => (
                                                    <div key={index} className="border rounded p-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h6 className="font-medium">Challenge {index + 1}</h6>
                                                            {isEditing && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => {
                                                                        const newChallenges = editData.challenge.challenges.filter((_: any, i: number) => i !== index);
                                                                        setEditData({
                                                                            ...editData,
                                                                            challenge: { ...editData.challenge, challenges: newChallenges },
                                                                        });
                                                                    }}
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="form-label text-sm">Text</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={challenge.text || ''}
                                                                    onChange={(e) => {
                                                                        const newChallenges = [...editData.challenge.challenges];
                                                                        newChallenges[index] = { ...newChallenges[index], text: e.target.value };
                                                                        setEditData({
                                                                            ...editData,
                                                                            challenge: { ...editData.challenge, challenges: newChallenges },
                                                                        });
                                                                    }}
                                                                    disabled={!isEditing}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    onSelect={handleMediaSelect}
                    onClose={() => {
                        setShowMediaPicker(false);
                        setMediaPickerTarget(null);
                    }}
                    title={
                        mediaPickerTarget === 'heroImage'
                            ? 'Select Hero Image'
                            : mediaPickerTarget === 'productIntegration'
                            ? 'Select Product Integration Image'
                            : mediaPickerTarget === 'technologyStack'
                            ? 'Select Technology Stack Image'
                            : mediaPickerTarget === 'scenarios'
                            ? 'Select Scenarios Image'
                            : mediaPickerTarget === 'challenge'
                            ? 'Select Challenge Image'
                            : 'Select Image'
                    }
                />
            )}
        </div>
    );
}
