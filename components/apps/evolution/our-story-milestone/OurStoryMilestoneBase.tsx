'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/layouts/loading';
import IconEdit from '@/components/icon/icon-edit';
import IconCheck from '@/components/icon/icon-checks';
import IconX from '@/components/icon/icon-x';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '../../explore/about-us/hooks/useImageUpload';
import { useUpdateOurStoryMilestoneByKey } from './hooks/useUpdateOurStoryMilestone';
import { type EvolutionOurStoryMilestone } from '@/db/schema';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface OurStoryMilestoneBaseProps {
    contentKey: string;
}

async function fetchOurStoryMilestone(key: string): Promise<EvolutionOurStoryMilestone | null> {
    try {
        // First try to get by specific key
        const encodedKey = encodeURIComponent(key);
        const response = await fetch(`/api/evolution/our-story-milestone?key=${encodedKey}`);

        if (response.ok) {
            const data = await response.json();
            if (data) return data;
        }

        // If specific key not found, get the first available entry
        console.log(`Key "${key}" not found, trying to get first available entry`);
        const allResponse = await fetch('/api/evolution/our-story-milestone');

        if (allResponse.ok) {
            const data = await allResponse.json();
            return data;
        }

        return null;
    } catch (error) {
        console.error('Error fetching our story milestone:', error);
        throw error;
    }
}

export default function OurStoryMilestoneBase({ contentKey }: OurStoryMilestoneBaseProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [activeImages, setActiveImages] = useState<any[]>([]);
    const [secondaryImages, setSecondaryImages] = useState<any[]>([]);
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'active' | 'secondary' | null>(null);

    const {
        data: ourStoryMilestone,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['evolution-our-story-milestone', contentKey],
        queryFn: () => fetchOurStoryMilestone(contentKey),
    });

    const updateMutation = useUpdateOurStoryMilestoneByKey();

    useEffect(() => {
        if (ourStoryMilestone) {
            setEditData({
                key: ourStoryMilestone.key,
                title: ourStoryMilestone.title,
                description: ourStoryMilestone.description,
                ourMilestone: {
                    title: ourStoryMilestone.ourMilestone.title,
                    maps: {
                        activeImg: ourStoryMilestone.ourMilestone.maps.activeImg,
                        secondaryImg: ourStoryMilestone.ourMilestone.maps.secondaryImg,
                    },
                },
            });
        }
    }, [ourStoryMilestone]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (ourStoryMilestone) {
            setEditData({
                key: ourStoryMilestone.key,
                title: ourStoryMilestone.title,
                description: ourStoryMilestone.description,
                ourMilestone: {
                    title: ourStoryMilestone.ourMilestone.title,
                    maps: {
                        activeImg: ourStoryMilestone.ourMilestone.maps.activeImg,
                        secondaryImg: ourStoryMilestone.ourMilestone.maps.secondaryImg,
                    },
                },
            });
        }
        setActiveImages([]);
        setSecondaryImages([]);
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            await updateMutation.mutateAsync(editData);
            setIsEditing(false);
            setActiveImages([]);
            setSecondaryImages([]);

            Swal.fire({
                title: 'Success!',
                text: 'Our story milestone updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating our story milestone:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update our story milestone',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Handle active image upload
    const handleActiveImageChange = async (imageList: ImageListType) => {
        setActiveImages(imageList);

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/our-story-milestone/active');
                setEditData({
                    ...editData,
                    ourMilestone: {
                        ...editData.ourMilestone,
                        maps: {
                            ...editData.ourMilestone.maps,
                            activeImg: result.url,
                        },
                    },
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'Active image uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload active image',
                    icon: 'error',
                });
                setActiveImages([]);
            }
        }
    };

    // Handle secondary image upload
    const handleSecondaryImageChange = async (imageList: ImageListType) => {
        setSecondaryImages(imageList);

        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/our-story-milestone/secondary');
                setEditData({
                    ...editData,
                    ourMilestone: {
                        ...editData.ourMilestone,
                        maps: {
                            ...editData.ourMilestone.maps,
                            secondaryImg: result.url,
                        },
                    },
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'Secondary image uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload secondary image',
                    icon: 'error',
                });
                setSecondaryImages([]);
            }
        }
    };

    // Open media picker
    const openMediaPicker = (target: 'active' | 'secondary') => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    // Handle media selection from picker
    const handleMediaSelect = (url: string, file?: any) => {
        if (!mediaPickerTarget) return;

        if (mediaPickerTarget === 'active') {
            setEditData({
                ...editData,
                ourMilestone: {
                    ...editData.ourMilestone,
                    maps: {
                        ...editData.ourMilestone.maps,
                        activeImg: url,
                    },
                },
            });
        } else if (mediaPickerTarget === 'secondary') {
            setEditData({
                ...editData,
                ourMilestone: {
                    ...editData.ourMilestone,
                    maps: {
                        ...editData.ourMilestone.maps,
                        secondaryImg: url,
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
                <div className="text-lg text-red-600">Error loading our story milestone</div>
            </div>
        );
    }

    if (!ourStoryMilestone && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No our story milestone found for key: {contentKey}</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                key: contentKey,
                                title: '',
                                description: '',
                                ourMilestone: {
                                    title: '',
                                    maps: {
                                        activeImg: '',
                                        secondaryImg: '',
                                    },
                                },
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Our Story Milestone
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
                    <h5 className="text-lg font-semibold dark:text-white-light">Our Story Milestone - {contentKey}</h5>
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
                {/* Basic Information */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="form-label">Key</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.key || ''}
                                    onChange={(e) => setEditData({ ...editData, key: e.target.value })}
                                    placeholder="Unique key identifier"
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{ourStoryMilestone?.key}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.title || ''}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    placeholder="Main title"
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{ourStoryMilestone?.title}</div>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Description</label>
                            {isEditing ? (
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={editData?.description || ''}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    placeholder="Description text"
                                />
                            ) : (
                                <div className="form-textarea bg-gray-100 min-h-[100px] p-3">{ourStoryMilestone?.description}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Our Milestone Section */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Our Milestone</h6>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Milestone Title</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editData?.ourMilestone?.title || ''}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            ourMilestone: {
                                                ...editData.ourMilestone,
                                                title: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="Milestone title"
                                />
                            ) : (
                                <div className="form-input bg-gray-100">{ourStoryMilestone?.ourMilestone?.title}</div>
                            )}
                        </div>

                        {/* Maps Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Active Image */}
                            <div>
                                <label className="form-label">Active Image</label>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        {editData?.ourMilestone?.maps?.activeImg && (
                                            <div className="border rounded p-2">
                                                <img src={editData.ourMilestone.maps.activeImg} alt="Active" className="w-full h-32 object-cover rounded mb-2" />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-600 truncate flex-1">{editData.ourMilestone.maps.activeImg}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditData({
                                                                ...editData,
                                                                ourMilestone: {
                                                                    ...editData.ourMilestone,
                                                                    maps: {
                                                                        ...editData.ourMilestone.maps,
                                                                        activeImg: '',
                                                                    },
                                                                },
                                                            })
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
                                            onClick={() => openMediaPicker('active')}
                                            className="btn btn-outline-primary btn-sm w-full"
                                        >
                                            Browse Media
                                        </button>
                                        <ImageUploading value={activeImages} onChange={handleActiveImageChange} maxNumber={1} dataURLKey="dataURL">
                                            {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                <button
                                                    type="button"
                                                    className={`btn btn-outline-primary btn-sm w-full ${isDragging ? 'bg-blue-100' : ''}`}
                                                    onClick={onImageUpload}
                                                    {...dragProps}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? 'Uploading...' : 'Upload Active Image'}
                                                </button>
                                            )}
                                        </ImageUploading>

                                        <div>
                                            <label className="form-label text-sm">Or enter URL manually</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.ourMilestone?.maps?.activeImg || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        ourMilestone: {
                                                            ...editData.ourMilestone,
                                                            maps: {
                                                                ...editData.ourMilestone.maps,
                                                                activeImg: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                placeholder="Active image URL"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded p-2">
                                        {ourStoryMilestone?.ourMilestone?.maps?.activeImg ? (
                                            <>
                                                <img src={ourStoryMilestone.ourMilestone.maps.activeImg} alt="Active" className="w-full h-32 object-cover rounded mb-2" />
                                                <p className="text-xs text-gray-600 truncate">{ourStoryMilestone.ourMilestone.maps.activeImg}</p>
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-center py-8">No active image</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Secondary Image */}
                            <div>
                                <label className="form-label">Secondary Image</label>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        {editData?.ourMilestone?.maps?.secondaryImg && (
                                            <div className="border rounded p-2">
                                                <img src={editData.ourMilestone.maps.secondaryImg} alt="Secondary" className="w-full h-32 object-cover rounded mb-2" />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-600 truncate flex-1">{editData.ourMilestone.maps.secondaryImg}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditData({
                                                                ...editData,
                                                                ourMilestone: {
                                                                    ...editData.ourMilestone,
                                                                    maps: {
                                                                        ...editData.ourMilestone.maps,
                                                                        secondaryImg: '',
                                                                    },
                                                                },
                                                            })
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
                                            onClick={() => openMediaPicker('secondary')}
                                            className="btn btn-outline-primary btn-sm w-full"
                                        >
                                            Browse Media
                                        </button>
                                        <ImageUploading value={secondaryImages} onChange={handleSecondaryImageChange} maxNumber={1} dataURLKey="dataURL">
                                            {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                <button
                                                    type="button"
                                                    className={`btn btn-outline-primary btn-sm w-full ${isDragging ? 'bg-blue-100' : ''}`}
                                                    onClick={onImageUpload}
                                                    {...dragProps}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? 'Uploading...' : 'Upload Secondary Image'}
                                                </button>
                                            )}
                                        </ImageUploading>

                                        <div>
                                            <label className="form-label text-sm">Or enter URL manually</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editData?.ourMilestone?.maps?.secondaryImg || ''}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        ourMilestone: {
                                                            ...editData.ourMilestone,
                                                            maps: {
                                                                ...editData.ourMilestone.maps,
                                                                secondaryImg: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                placeholder="Secondary image URL"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded p-2">
                                        {ourStoryMilestone?.ourMilestone?.maps?.secondaryImg ? (
                                            <>
                                                <img src={ourStoryMilestone.ourMilestone.maps.secondaryImg} alt="Secondary" className="w-full h-32 object-cover rounded mb-2" />
                                                <p className="text-xs text-gray-600 truncate">{ourStoryMilestone.ourMilestone.maps.secondaryImg}</p>
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-center py-8">No secondary image</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
                    title={`Select ${mediaPickerTarget === 'active' ? 'Active' : 'Secondary'} Image`}
                    allowUrlInput={false}
                />
            )}
        </div>
    );
}
