'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';
import { useTeamGreen, useUpdateCultureAction } from '@/hooks/useTeamGreen';

interface CultureAction {
    title: string;
    description: string;
    keypoint: string[];
    quote: string;
    quoteHighlighted: string;
    img: string;
    text: string;
}

const EditCultureActionPage = () => {
    const router = useRouter();
    const { data: teamGreenData, isLoading } = useTeamGreen();
    const updateCultureAction = useUpdateCultureAction();
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    
    const [formData, setFormData] = useState<CultureAction>({
        title: '',
        description: '',
        keypoint: [],
        quote: '',
        quoteHighlighted: '',
        img: '',
        text: '',
    });

    useEffect(() => {
        if (teamGreenData?.ourCultureActionModal) {
            const data = teamGreenData.ourCultureActionModal;
            
            // Handle quote data transformation if it comes as an object
            let quote = '';
            let quoteHighlighted = '';
            
            if (typeof data.quote === 'object' && data.quote !== null && 'text' in data.quote) {
                const quoteObj = data.quote as { text: string; highlightedText: string };
                quote = quoteObj.text || '';
                quoteHighlighted = quoteObj.highlightedText || '';
            } else {
                quote = (data.quote as string) || '';
                quoteHighlighted = data.quoteHighlighted || '';
            }
            
            setFormData({
                ...data,
                quote,
                quoteHighlighted,
                keypoint: data.keypoint || []
            });
        }
    }, [teamGreenData]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleKeypointChange = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            keypoint: (prev.keypoint || []).map((item, i) => (i === index ? value : item)),
        }));
    };

    const addKeypoint = () => {
        setFormData((prev) => ({
            ...prev,
            keypoint: [...(prev.keypoint || []), ''],
        }));
    };

    const removeKeypoint = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            keypoint: (prev.keypoint || []).filter((_, i) => i !== index),
        }));
    };

    const handleMediaSelect = (url: string) => {
        handleInputChange('img', url);
        setShowMediaPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateCultureAction.mutateAsync(formData);
            Swal.fire('Success', 'Culture action updated successfully', 'success');
            router.push('/empower/team-green');
        } catch (error: any) {
            console.error('Update culture action error:', error);
            Swal.fire('Error', error.message || 'Failed to update culture action', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Edit Culture Action</h5>
                    <button onClick={() => router.push('/empower/team-green')} className="btn btn-outline-primary">
                        Back to Team Green
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => handleInputChange('title', e.target.value)} 
                            className="form-input w-full" 
                            placeholder="Enter culture action title"
                            required 
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => handleInputChange('description', e.target.value)} 
                            className="form-textarea w-full" 
                            rows={4} 
                            placeholder="Describe the culture action"
                            required
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Featured Image</label>
                        <ImageUploadField
                            value={{ src: formData.img, alt: formData.title }}
                            onChange={(img) => handleInputChange('img', img.src)}
                            folder="empower/team-green/culture-action"
                            label=""
                        />
                        
                        {/* Browse Media Library Button */}
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="mt-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            Browse Media Library
                        </button>
                    </div>

                    {/* Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Content Text</label>
                        <textarea 
                            value={formData.text} 
                            onChange={(e) => handleInputChange('text', e.target.value)} 
                            className="form-textarea w-full" 
                            rows={6} 
                            placeholder="Enter detailed content text about the culture action"
                        />
                    </div>

                    {/* Key Points Section */}
                    <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Key Points</h3>
                            <button 
                                type="button" 
                                onClick={addKeypoint} 
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Add Key Point
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.keypoint?.map((keypoint, index) => (
                                <div key={index} className="border rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Key Point {index + 1}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeKeypoint(index)} 
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <textarea 
                                        value={keypoint} 
                                        onChange={(e) => handleKeypointChange(index, e.target.value)} 
                                        className="form-textarea w-full" 
                                        rows={2}
                                        placeholder="Enter key point text"
                                    />
                                </div>
                            ))}

                            {(!formData.keypoint || formData.keypoint.length === 0) && (
                                <p className="text-gray-500 text-center py-4">No key points added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Quote Section */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Quote Section</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea 
                                    value={formData.quote} 
                                    onChange={(e) => handleInputChange('quote', e.target.value)} 
                                    className="form-textarea w-full" 
                                    rows={3} 
                                    placeholder="Enter inspirational quote about culture"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Highlighted Text</label>
                                <input 
                                    type="text" 
                                    value={formData.quoteHighlighted} 
                                    onChange={(e) => handleInputChange('quoteHighlighted', e.target.value)} 
                                    className="form-input w-full" 
                                    placeholder="Text to highlight in the quote"
                                />
                            </div>
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
                            disabled={updateCultureAction.isPending} 
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {updateCultureAction.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                {/* Media Picker Modal */}
                <MediaPicker
                    isOpen={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={handleMediaSelect}
                    allowedTypes={['image']}
                    title="Select Culture Action Image"
                />
            </div>
        </ProtectedRoute>
    );
};

export default EditCultureActionPage;