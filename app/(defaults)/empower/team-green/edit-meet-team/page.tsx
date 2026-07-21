'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { useTeamGreen, useUpdateMeetTeam } from '@/hooks/useTeamGreen';

interface TeamMember {
    img: string;
    name: string;
    position: string;
}

interface Designation {
    name: string;
    members: TeamMember[];
}

interface MeetTeam {
    title: string;
    description: string;
    designations: Designation[];
    quote: {
        text: string;
        highlightedText: string;
    };
}

const EditMeetTeamPage = () => {
    const router = useRouter();
    const { data: teamGreenData, isLoading } = useTeamGreen();
    const updateMeetTeam = useUpdateMeetTeam();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [currentMemberIndex, setCurrentMemberIndex] = useState<{ designationIndex: number; memberIndex: number } | null>(null);
    
    const [formData, setFormData] = useState<MeetTeam>({
        title: '',
        description: '',
        designations: [],
        quote: {
            text: '',
            highlightedText: '',
        },
    });

    useEffect(() => {
        if (teamGreenData?.meetTeam) {
            setFormData(teamGreenData.meetTeam);
        }
    }, [teamGreenData]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleQuoteChange = (field: 'text' | 'highlightedText', value: string) => {
        setFormData((prev) => ({
            ...prev,
            quote: {
                ...prev.quote,
                [field]: value,
            },
        }));
    };

    const handleDesignationNameChange = (designationIndex: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            designations: (prev.designations || []).map((designation, i) => 
                i === designationIndex ? { ...designation, name: value } : designation
            ),
        }));
    };

    const handleMemberChange = (designationIndex: number, memberIndex: number, field: keyof TeamMember, value: string) => {
        setFormData((prev) => ({
            ...prev,
            designations: (prev.designations || []).map((designation, i) => 
                i === designationIndex ? {
                    ...designation,
                    members: (designation.members || []).map((member, j) => 
                        j === memberIndex ? { ...member, [field]: value } : member
                    )
                } : designation
            ),
        }));
    };

    const addDesignation = () => {
        setFormData((prev) => ({
            ...prev,
            designations: [...(prev.designations || []), { name: '', members: [] }],
        }));
    };

    const removeDesignation = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            designations: (prev.designations || []).filter((_, i) => i !== index),
        }));
    };

    const addMember = (designationIndex: number) => {
        setFormData((prev) => ({
            ...prev,
            designations: (prev.designations || []).map((designation, i) => 
                i === designationIndex ? {
                    ...designation,
                    members: [...(designation.members || []), { img: '', name: '', position: '' }]
                } : designation
            ),
        }));
    };

    const removeMember = (designationIndex: number, memberIndex: number) => {
        setFormData((prev) => ({
            ...prev,
            designations: (prev.designations || []).map((designation, i) => 
                i === designationIndex ? {
                    ...designation,
                    members: (designation.members || []).filter((_, j) => j !== memberIndex)
                } : designation
            ),
        }));
    };

    const openMediaPicker = (designationIndex: number, memberIndex: number) => {
        setCurrentMemberIndex({ designationIndex, memberIndex });
        setShowMediaPicker(true);
    };

    const handleMediaSelect = (url: string) => {
        if (currentMemberIndex) {
            handleMemberChange(currentMemberIndex.designationIndex, currentMemberIndex.memberIndex, 'img', url);
        }
        setShowMediaPicker(false);
        setCurrentMemberIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateMeetTeam.mutateAsync(formData);
            Swal.fire('Success', 'Meet team section updated successfully', 'success');
            router.push('/empower/team-green');
        } catch (error: any) {
            console.error('Update meet team error:', error);
            Swal.fire('Error', error.message || 'Failed to update meet team section', 'error');
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'empower', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Edit Meet Team Section</h5>
                    <button onClick={() => router.push('/empower/team-green')} className="btn btn-outline-primary">
                        Back to Team Green
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Section Title</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => handleInputChange('title', e.target.value)} 
                            className="form-input w-full" 
                            placeholder="e.g., Meet Our Team"
                            required 
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Section Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => handleInputChange('description', e.target.value)} 
                            className="form-textarea w-full" 
                            rows={4} 
                            placeholder="Introduce your team and what makes them special"
                            required
                        />
                    </div>

                    {/* Quote Section */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Team Quote</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea 
                                    value={formData.quote.text} 
                                    onChange={(e) => handleQuoteChange('text', e.target.value)} 
                                    className="form-textarea w-full" 
                                    rows={3} 
                                    placeholder="Enter a motivational quote about your team"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input 
                                    type="text" 
                                    value={formData.quote.highlightedText} 
                                    onChange={(e) => handleQuoteChange('highlightedText', e.target.value)} 
                                    className="form-input w-full" 
                                    placeholder="Text to highlight in the quote"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Team Designations Section */}
                    <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Team Structure</h3>
                            <button 
                                type="button" 
                                onClick={addDesignation} 
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Add Team/Department
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.designations?.map((designation, designationIndex) => (
                                <div key={designationIndex} className="border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-medium">Team/Department {designationIndex + 1}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeDesignation(designationIndex)} 
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Remove Team
                                        </button>
                                    </div>

                                    {/* Team/Department Name */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Team/Department Name</label>
                                        <input 
                                            type="text"
                                            value={designation.name} 
                                            onChange={(e) => handleDesignationNameChange(designationIndex, e.target.value)} 
                                            className="form-input w-full" 
                                            placeholder="e.g., Leadership Team, Engineering Team, Sales Team, etc."
                                            required
                                        />
                                    </div>

                                    {/* Team Members */}
                                    <div className="border rounded p-3 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-medium">Team Members in {designation.name || 'this team'}</h4>
                                            <button 
                                                type="button" 
                                                onClick={() => addMember(designationIndex)} 
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Add Team Member
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {designation.members.map((member, memberIndex) => (
                                                <div key={memberIndex} className="border rounded p-3 bg-white">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium">Team Member {memberIndex + 1}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeMember(designationIndex, memberIndex)} 
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Member Photo */}
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Profile Photo</label>
                                                            <ImageUploadField
                                                                value={{ src: member.img, alt: member.name }}
                                                                onChange={(img) => handleMemberChange(designationIndex, memberIndex, 'img', img.src)}
                                                                folder="empower/team-green/team-members"
                                                                label=""
                                                            />
                                                            
                                                            {/* Browse Media Library Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => openMediaPicker(designationIndex, memberIndex)}
                                                                className="mt-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                                                            >
                                                                Browse Media Library
                                                            </button>
                                                        </div>

                                                        {/* Member Name */}
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Full Name</label>
                                                            <input 
                                                                type="text"
                                                                value={member.name} 
                                                                onChange={(e) => handleMemberChange(designationIndex, memberIndex, 'name', e.target.value)} 
                                                                className="form-input w-full" 
                                                                placeholder="Enter team member's name"
                                                                required
                                                            />
                                                        </div>

                                                        {/* Member Position */}
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Job Title/Position</label>
                                                            <input 
                                                                type="text"
                                                                value={member.position} 
                                                                onChange={(e) => handleMemberChange(designationIndex, memberIndex, 'position', e.target.value)} 
                                                                className="form-input w-full" 
                                                                placeholder="Enter job title or position"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {designation.members.length === 0 && (
                                                <p className="text-gray-500 text-center py-3">No team members added yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!formData.designations || formData.designations.length === 0) && (
                                <p className="text-gray-500 text-center py-4">No teams/departments added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={() => router.push('/empower/team-green')} 
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={updateMeetTeam.isPending} 
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {updateMeetTeam.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                {/* Media Picker Modal */}
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={handleMediaSelect}
                    allowedTypes={['image']}
                    title="Select Team Member Photo"
                />
            </div>
        </ProtectedRoute>
    );
};

export default EditMeetTeamPage;