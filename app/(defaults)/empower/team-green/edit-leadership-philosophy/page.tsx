'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useTeamGreen, useUpdateLeadershipPhilosophy } from '@/hooks/useTeamGreen';

interface LeadershipPhilosophy {
    title: string;
    description: string;
    keyPoints: string[];
    quote: {
        text: string;
        highlightedText: string;
    };
    qualities: string[];
}

const EditLeadershipPhilosophyPage = () => {
    const router = useRouter();
    const { data: teamGreenData, isLoading } = useTeamGreen();
    const updateLeadershipPhilosophy = useUpdateLeadershipPhilosophy();
    
    const [formData, setFormData] = useState<LeadershipPhilosophy>({
        title: '',
        description: '',
        keyPoints: [],
        quote: {
            text: '',
            highlightedText: '',
        },
        qualities: [],
    });

    useEffect(() => {
        if (teamGreenData?.ourLeadershipPhilosophy) {
            setFormData(teamGreenData.ourLeadershipPhilosophy);
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

    const handleKeyPointChange = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            keyPoints: (prev.keyPoints || []).map((item, i) => (i === index ? value : item)),
        }));
    };

    const addKeyPoint = () => {
        setFormData((prev) => ({
            ...prev,
            keyPoints: [...(prev.keyPoints || []), ''],
        }));
    };

    const removeKeyPoint = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            keyPoints: (prev.keyPoints || []).filter((_, i) => i !== index),
        }));
    };

    const handleQualityChange = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            qualities: (prev.qualities || []).map((item, i) => (i === index ? value : item)),
        }));
    };

    const addQuality = () => {
        setFormData((prev) => ({
            ...prev,
            qualities: [...(prev.qualities || []), ''],
        }));
    };

    const removeQuality = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            qualities: (prev.qualities || []).filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateLeadershipPhilosophy.mutateAsync(formData);
            Swal.fire('Success', 'Leadership philosophy updated successfully', 'success');
            router.push('/empower/team-green');
        } catch (error: any) {
            console.error('Update leadership philosophy error:', error);
            Swal.fire('Error', error.message || 'Failed to update leadership philosophy', 'error');
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
                    <h5 className="font-semibold text-lg dark:text-white-light">Edit Leadership Philosophy</h5>
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
                            required
                        />
                    </div>

                    {/* Key Points Section */}
                    <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Key Points</h3>
                            <button 
                                type="button" 
                                onClick={addKeyPoint} 
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Add Key Point
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.keyPoints?.map((keyPoint, index) => (
                                <div key={index} className="border rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Key Point {index + 1}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeKeyPoint(index)} 
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <textarea 
                                        value={keyPoint} 
                                        onChange={(e) => handleKeyPointChange(index, e.target.value)} 
                                        className="form-textarea w-full" 
                                        rows={2}
                                        placeholder="Enter key point text"
                                    />
                                </div>
                            ))}

                            {(!formData.keyPoints || formData.keyPoints.length === 0) && (
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
                                    value={formData.quote.text} 
                                    onChange={(e) => handleQuoteChange('text', e.target.value)} 
                                    className="form-textarea w-full" 
                                    rows={3} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input 
                                    type="text" 
                                    value={formData.quote.highlightedText} 
                                    onChange={(e) => handleQuoteChange('highlightedText', e.target.value)} 
                                    className="form-input w-full" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Qualities Section */}
                    <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Leadership Qualities</h3>
                            <button 
                                type="button" 
                                onClick={addQuality} 
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                Add Quality
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.qualities?.map((quality, index) => (
                                <div key={index} className="border rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Quality {index + 1}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeQuality(index)} 
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <input 
                                        type="text"
                                        value={quality} 
                                        onChange={(e) => handleQualityChange(index, e.target.value)} 
                                        className="form-input w-full" 
                                        placeholder="Enter leadership quality"
                                    />
                                </div>
                            ))}

                            {(!formData.qualities || formData.qualities.length === 0) && (
                                <p className="text-gray-500 text-center py-4">No qualities added yet</p>
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
                            disabled={updateLeadershipPhilosophy.isPending} 
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {updateLeadershipPhilosophy.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
};

export default EditLeadershipPhilosophyPage;