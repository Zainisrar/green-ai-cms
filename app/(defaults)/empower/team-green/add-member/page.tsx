'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useImageUpload } from '@/components/apps/explore/about-us/hooks/useImageUpload';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface TeamGreenImage {
    src: string;
    alt: string;
}

interface TeamMember {
    name: string;
    designation: string;
    img: TeamGreenImage;
}



const AddMemberPage = () => {
    const router = useRouter();
    const { uploadImage, isUploading } = useImageUpload();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [memberImages, setMemberImages] = useState<ImageListType>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    
    const [formData, setFormData] = useState<TeamMember>({
        name: '',
        designation: '',
        img: { src: '', alt: '' }
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedInputChange = (parent: 'img', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.designation.trim()) {
            newErrors.designation = 'Designation is required';
        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = async (imageList: ImageListType) => {
        setMemberImages(imageList);
        
        if (imageList.length > 0 && imageList[0].file) {
            try {
                const result = await uploadImage(imageList[0].file, 'team-members');
                setFormData(prev => ({
                    ...prev,
                    img: {
                        ...prev.img,
                        src: result.url
                    }
                }));
            } catch (error) {
                console.error('Image upload error:', error);
                Swal.fire('Error', 'Failed to upload image', 'error');
            }
        }
    };

    const handleMediaSelect = (url: string) => {
        setFormData(prev => ({
            ...prev,
            img: {
                ...prev.img,
                src: url
            }
        }));
        setMemberImages([{ data_url: url }]);
        setShowMediaPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // First fetch existing team green data
            const existingResult = await apiClient.get('/api/empower/team-green');
            const existingData = existingResult.data;

            // Create member object without jobTitle field
            const memberData: TeamMember = {
                name: formData.name,
                designation: formData.designation,
                img: formData.img
            };

            // Add member to the first job title group, or create one if none exists
            const existingJobTitles = existingData?.meetTeam?.jobTitle || [];
            let updatedJobTitles;
            
            if (existingJobTitles.length > 0) {
                // Add to the first existing group
                updatedJobTitles = existingJobTitles.map((jt: any, index: number) => 
                    index === 0 
                        ? { members: [...jt.members, memberData] }
                        : jt
                );
            } else {
                // Create first job title group
                updatedJobTitles = [{ members: [memberData] }];
            }

            const updatedMeetTeam = {
                title: existingData?.meetTeam?.title || '',
                description: existingData?.meetTeam?.description || '',
                quote: existingData?.meetTeam?.quote || { text1: '', text2: '', highlighted: '' },
                jobTitle: updatedJobTitles
            };

            const payload = {
                id: existingData?.id,
                mainPage: existingData?.mainPage || {
                    title: '',
                    subHeadline: '',
                    description: { text: '', highlighted: '' },
                    quote1: { text: '', highlighted: '' },
                    quote2: { text: '', highlighted: '' },
                    cta: [],
                    keys: []
                },
                whoWeAreModal: existingData?.whoWeAreModal || {
                    title: '',
                    description: '',
                    img: { src: '', alt: '', highlighted: '' },
                    title2: '',
                    description2: '',
                    quote: { text: '', highlighted: '' }
                },
                ourLeadershipPhilosophy: existingData?.ourLeadershipPhilosophy || {
                    title: '',
                    description: '',
                    icon: [],
                    quote: { text: '', highlighted: '' }
                },
                meetTeam: updatedMeetTeam,
                ourCultureActionModal: existingData?.ourCultureActionModal || {
                    title: '',
                    description: '',
                    img: { src: '', alt: '' },
                    keys: [],
                    quote: { text: '', highlighted: '' }
                }
            };

            const result = existingData?.id 
                ? await apiClient.put('/api/empower/team-green', payload)
                : await apiClient.post('/api/empower/team-green', payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Team member added successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/empower/team-green');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to add team member', 'error');
            }
        } catch (error: any) {
            console.error('Add team member error:', error);
            Swal.fire('Error', error.message || 'Failed to add team member', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Add Team Member</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter member name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Designation */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Designation *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter designation/job title"
                            value={formData.designation}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                        />
                        {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
                    </div>



                    {/* Member Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Member Photo
                        </label>
                        <ImageUploading
                            value={memberImages}
                            onChange={handleImageUpload}
                            maxNumber={1}
                            dataURLKey="data_url"
                        >
                            {({
                                imageList,
                                onImageUpload,
                                onImageUpdate,
                                onImageRemove,
                                isDragging,
                                dragProps,
                            }) => (
                                <div className="space-y-4">
                                    {imageList.length === 0 ? (
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                                isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                                            }`}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            <div className="space-y-2">
                                                <div className="text-gray-500">
                                                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                                                </div>
                                                <div className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {imageList.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={image.data_url}
                                                        alt="Member"
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => onImageUpdate(index)}
                                                            className="btn btn-sm btn-primary bg-green-600 hover:bg-green-700"
                                                            disabled={isUploading}
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onImageRemove(index)}
                                                            className="btn btn-sm btn-danger"
                                                            disabled={isUploading}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    {isUploading && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                            <div className="text-white">Uploading...</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </ImageUploading>
                        
                        {/* Browse Media Library Button */}
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="mt-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            Browse Media Library
                        </button>
                    </div>

                    {/* Image Alt Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Image Alt Text
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Image description"
                            value={formData.img.alt}
                            onChange={(e) => handleNestedInputChange('img', 'alt', e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Adding...' : 'Add Team Member'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* Media Picker Modal */}
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={handleMediaSelect}
                    allowedTypes={['image']}
                    title="Select Member Photo"
                />
            </div>
        </ProtectedRoute>
    );
};

export default AddMemberPage;