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
import { useUpdateLeadershipTeam } from './hooks/useUpdateLeadershipTeam';
import { type EvolutionLeadershipTeam } from '@/db/schema';
import MediaPicker from '@/components/apps/media/MediaPicker';

async function fetchLeadershipTeam(): Promise<EvolutionLeadershipTeam | null> {
    try {
        const response = await fetch('/api/evolution/leadership-team');
        
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching leadership team:', error);
        throw error;
    }
}

export default function LeadershipTeamBase() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{
        sectionIndex: number;
        memberIndex: number;
    } | null>(null);

    const { data: leadershipTeam, isLoading, error } = useQuery({
        queryKey: ['evolution-leadership-team'],
        queryFn: fetchLeadershipTeam,
    });

    const updateMutation = useUpdateLeadershipTeam();

    useEffect(() => {
        if (leadershipTeam) {
            setEditData({
                sections: leadershipTeam.sections
            });
        }
    }, [leadershipTeam]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (leadershipTeam) {
            setEditData({
                sections: leadershipTeam.sections
            });
        }
    };

    const handleSave = async () => {
        if (!editData) return;

        try {
            await updateMutation.mutateAsync({
                id: leadershipTeam?.id,
                sections: editData.sections,
            });

            setIsEditing(false);
            
            Swal.fire({
                title: 'Success!',
                text: 'Leadership team updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error updating leadership team:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update leadership team',
                icon: 'error',
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleMemberImageUpload = async (sectionIndex: number, memberIndex: number, imageList: ImageListType) => {
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'evolution/leadership-team/members');
                
                const newSections = [...editData.sections];
                const newMembers = [...newSections[sectionIndex].members];
                newMembers[memberIndex] = { 
                    ...newMembers[memberIndex], 
                    img: { ...newMembers[memberIndex].img, src: result.url }
                };
                newSections[sectionIndex] = { ...newSections[sectionIndex], members: newMembers };
                setEditData({ ...editData, sections: newSections });

                Swal.fire({
                    title: 'Success!',
                    text: 'Member image uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload member image',
                    icon: 'error',
                });
            }
        }
    };

    // Open media picker for member image selection
    const openMediaPicker = (sectionIndex: number, memberIndex: number) => {
        setMediaPickerTarget({ sectionIndex, memberIndex });
        setShowMediaPicker(true);
    };

    // Handle media selection from picker
    const handleMediaSelect = (url: string, file?: any) => {
        if (!mediaPickerTarget) return;

        const { sectionIndex, memberIndex } = mediaPickerTarget;
        const newSections = [...editData.sections];
        const newMembers = [...newSections[sectionIndex].members];
        newMembers[memberIndex] = { 
            ...newMembers[memberIndex], 
            img: { ...newMembers[memberIndex].img, src: url }
        };
        newSections[sectionIndex] = { ...newSections[sectionIndex], members: newMembers };
        setEditData({ ...editData, sections: newSections });

        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    const addNewMember = (sectionIndex: number) => {
        const newMember = {
            name: 'New Member',
            designation: 'Position',
            img: { src: '/images/team/placeholder.jpg', alt: 'Portrait of New Member' }
        };

        const newSections = [...editData.sections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            members: [...newSections[sectionIndex].members, newMember]
        };
        setEditData({ ...editData, sections: newSections });
    };

    const removeMember = (sectionIndex: number, memberIndex: number) => {
        const newSections = [...editData.sections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            members: newSections[sectionIndex].members.filter((_: any, i: number) => i !== memberIndex)
        };
        setEditData({ ...editData, sections: newSections });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error loading leadership team</div>
            </div>
        );
    }

    if (!leadershipTeam && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg mb-4">No leadership team found</div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setEditData({
                                sections: [{
                                    id: 'leadership-team',
                                    title: 'LEADERSHIP TEAM',
                                    members: []
                                }]
                            });
                            setIsEditing(true);
                        }}
                    >
                        Create Leadership Team
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
                        Leadership Team Management
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
                {(isEditing ? editData?.sections : leadershipTeam?.sections)?.map((section: any, sectionIndex: number) => (
                    <div key={section.id} className="panel">
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h6 className="text-lg font-semibold">
                                    {section.id}
                                    <span className="ml-2 badge bg-primary text-xs">
                                        {section.members?.length || 0} members
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

                            {/* Members Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h6 className="font-semibold">Team Members</h6>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => addNewMember(sectionIndex)}
                                        >
                                            <IconPlus className="h-4 w-4 mr-1" />
                                            Add Member
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {section.members?.map((member: any, memberIndex: number) => (
                                        <div key={memberIndex} className="panel border">
                                            <div className="flex items-center justify-between mb-3">
                                                <h6 className="font-medium">{member.name}</h6>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeMember(sectionIndex, memberIndex)}
                                                    >
                                                        <IconTrash className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="form-label text-sm">Member Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={member.name}
                                                            onChange={(e) => {
                                                                const newSections = [...editData.sections];
                                                                const newMembers = [...section.members];
                                                                newMembers[memberIndex] = { ...member, name: e.target.value };
                                                                newSections[sectionIndex] = { ...section, members: newMembers };
                                                                setEditData({ ...editData, sections: newSections });
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="form-label text-sm">Designation</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={member.designation}
                                                            onChange={(e) => {
                                                                const newSections = [...editData.sections];
                                                                const newMembers = [...section.members];
                                                                newMembers[memberIndex] = { ...member, designation: e.target.value };
                                                                newSections[sectionIndex] = { ...section, members: newMembers };
                                                                setEditData({ ...editData, sections: newSections });
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="form-label text-sm">Profile Image Upload</label>
                                                        <div className="space-y-2">
                                                            {member.img.src && (
                                                                <div className="flex items-center gap-2 p-2 border rounded">
                                                                    <img 
                                                                        src={member.img.src} 
                                                                        alt={member.img.alt}
                                                                        className="w-12 h-12 object-cover rounded-full"
                                                                    />
                                                                    <span className="text-xs text-gray-600 flex-1 truncate">
                                                                        {member.img.src}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newSections = [...editData.sections];
                                                                            const newMembers = [...section.members];
                                                                            newMembers[memberIndex] = { 
                                                                                ...member, 
                                                                                img: { ...member.img, src: '' }
                                                                            };
                                                                            newSections[sectionIndex] = { ...section, members: newMembers };
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
                                                                onClick={() => openMediaPicker(sectionIndex, memberIndex)}
                                                                className="btn btn-outline-primary btn-sm w-full"
                                                            >
                                                                Browse Media
                                                            </button>
                                                            <ImageUploading 
                                                                value={[]} 
                                                                onChange={(imageList) => handleMemberImageUpload(sectionIndex, memberIndex, imageList)}
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
                                                                        {isUploading ? 'Uploading...' : 'Upload Profile Image'}
                                                                    </button>
                                                                )}
                                                            </ImageUploading>
                                                            
                                                            <div>
                                                                <label className="form-label text-sm">Or enter URL manually</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    value={member.img.src}
                                                                    onChange={(e) => {
                                                                        const newSections = [...editData.sections];
                                                                        const newMembers = [...section.members];
                                                                        newMembers[memberIndex] = { 
                                                                            ...member, 
                                                                            img: { ...member.img, src: e.target.value }
                                                                        };
                                                                        newSections[sectionIndex] = { ...section, members: newMembers };
                                                                        setEditData({ ...editData, sections: newSections });
                                                                    }}
                                                                    placeholder="Profile image URL"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="form-label text-sm">Image Alt Text</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={member.img.alt}
                                                            onChange={(e) => {
                                                                const newSections = [...editData.sections];
                                                                const newMembers = [...section.members];
                                                                newMembers[memberIndex] = { 
                                                                    ...member, 
                                                                    img: { ...member.img, alt: e.target.value }
                                                                };
                                                                newSections[sectionIndex] = { ...section, members: newMembers };
                                                                setEditData({ ...editData, sections: newSections });
                                                            }}
                                                            placeholder="Portrait of [Name]"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <img 
                                                        src={member.img.src} 
                                                        alt={member.img.alt}
                                                        className="w-20 h-20 object-cover rounded-full mx-auto mb-3"
                                                    />
                                                    <h6 className="font-medium mb-1">{member.name}</h6>
                                                    <p className="text-sm text-gray-600">{member.designation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
                    title="Select Profile Image"
                    allowUrlInput={false}
                />
            )}
        </div>
    );
}