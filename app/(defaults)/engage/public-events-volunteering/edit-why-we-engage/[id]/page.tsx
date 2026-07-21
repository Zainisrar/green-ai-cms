'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface WhyWeEngageData {
    title: string;
    subHeadline: string;
    img: {
        src: string;
        alt: string;
    };
    quote: {
        text: string;
        highlighted: string;
    };
    content: string;
}

const EditWhyWeEngagePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    
    const [formData, setFormData] = useState<WhyWeEngageData>({
        title: '',
        subHeadline: '',
        img: { src: '', alt: '' },
        quote: { text: '', highlighted: '' },
        content: '',
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/public-events-volunteering/${id}`);
            if (result.success && result.data.modals.whyWeEngage) {
                setFormData(result.data.modals.whyWeEngage);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof WhyWeEngageData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [field]: value }
        }));
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleMediaSelect = (media: any) => {
        setFormData(prev => ({ ...prev, img: { ...prev.img, src: media.url } }));
        setShowMediaPicker(false);
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, img: { src: '', alt: '' } }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.subHeadline.trim()) {
            newErrors.subHeadline = 'Sub-headline is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await apiClient.patch(`/api/engage/public-events-volunteering/${id}`, {
                modals: { whyWeEngage: formData }
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Why We Engage section updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/public-events-volunteering');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update', 'error');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire('Error', error.message || 'Failed to update', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
                <div className="panel">
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredPermission={{ resource: 'engage', action: 'edit' }}>
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/engage/public-events-volunteering')}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Why We Engage</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Basic Information</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Sub-Headline *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter sub-headline"
                                    value={formData.subHeadline}
                                    onChange={(e) => handleInputChange('subHeadline', e.target.value)}
                                />
                                {errors.subHeadline && <p className="text-red-500 text-sm mt-1">{errors.subHeadline}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Image</h6>
                        
                        <div className="space-y-4">
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowMediaPicker(true)}
                                    className="btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 btn-sm"
                                >
                                    Browse Media Library
                                </button>
                            </div>
                            
                            <ImageUploadField
                                value={formData.img}
                                onChange={(img) => setFormData(prev => ({ ...prev, img }))}
                                folder="engage/public-events-volunteering"
                                label="Or Upload New Image"
                            />

                            {/* Image Preview */}
                            {formData.img.src && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Image Preview</label>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <img
                                            src={formData.img.src}
                                            alt={formData.img.alt}
                                            className="h-48 w-auto object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="btn btn-outline-danger btn-xs mt-2"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rich Text Content */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Rich Text Content</h6>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Content</label>
                            <div className="bg-white dark:bg-gray-800 rounded-lg">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    placeholder="Enter rich text content..."
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            [{ 'color': [] }, { 'background': [] }],
                                            ['link', 'image'],
                                            ['clean']
                                        ],
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Quote</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Enter quote text"
                                    value={formData.quote.text}
                                    onChange={(e) => handleNestedChange('quote', 'text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Text to highlight in the quote"
                                    value={formData.quote.highlighted}
                                    onChange={(e) => handleNestedChange('quote', 'highlighted', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Updating...' : 'Update Why We Engage'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/engage/public-events-volunteering')}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <MediaPicker
                isOpen={showMediaPicker}
                onSelect={handleMediaSelect}
                onClose={() => setShowMediaPicker(false)}
                allowedTypes={['image']}
            />
        </ProtectedRoute>
    );
};

export default EditWhyWeEngagePage;