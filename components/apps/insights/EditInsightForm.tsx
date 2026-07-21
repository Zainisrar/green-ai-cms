'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insightApi, insightKeys, UpdateInsightData, InsightKey, InsightCTA } from '@/lib/api/insights';
import { insightDetailApi, insightDetailKeys } from '@/lib/api/insightDetails';
import { homeApi, homeKeys } from '@/lib/api/home';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface EditInsightFormProps {
    insightId: string;
}

const EditInsightForm = ({ insightId }: EditInsightFormProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<UpdateInsightData>({
        headline: '',
        subheadline: '',
        highlighted: '',
        description: '',
        bgImg: '',
        keys: [{ icon: '', text: '' }],
        cta1: { text: '', link: '' },
        cta2: { text: '', link: '' }
    });

    const [backgroundImage, setBackgroundImage] = useState({ src: '', alt: '' });
    const [keyImages, setKeyImages] = useState<{ [key: number]: { src: string; alt: string } }>({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'background' | number | null>(null);

    // Fetch insights details for CTA1 dropdown
    const { data: insightDetails } = useQuery({
        queryKey: insightDetailKeys.lists(),
        queryFn: () => insightDetailApi.getAll(),
    });

    // Fetch home pages for CTA2 dropdown
    const { data: homePages } = useQuery({
        queryKey: homeKeys.lists(),
        queryFn: () => homeApi.getAll(),
    });

    const { data: insight, isLoading, error } = useQuery({
        queryKey: insightKeys.detail(insightId),
        queryFn: () => insightApi.getById(insightId),
        enabled: !!insightId,
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateInsightData) => insightApi.update(insightId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: insightKeys.lists() });
            queryClient.invalidateQueries({ queryKey: insightKeys.detail(insightId) });
            Swal.fire({
                title: 'Success!',
                text: 'Mining insight updated successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                router.push('/insights');
            });
        },
        onError: (error) => {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update mining insight.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    useEffect(() => {
        if (insight) {
            setFormData({
                headline: insight.headline,
                subheadline: insight.subheadline,
                highlighted: insight.highlighted,
                description: insight.description,
                bgImg: insight.bgImg,
                keys: insight.keys,
                cta1: insight.cta1,
                cta2: insight.cta2
            });
            setBackgroundImage({ src: insight.bgImg, alt: '' });
            
            // Initialize key images from existing data
            const initialKeyImages: { [key: number]: { src: string; alt: string } } = {};
            insight.keys.forEach((key, index) => {
                initialKeyImages[index] = { src: key.icon, alt: '' };
            });
            setKeyImages(initialKeyImages);
        }
    }, [insight]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!backgroundImage.src) {
            Swal.fire({
                title: 'Missing Image!',
                text: 'Please upload a background image before submitting.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Check if all key point icons are uploaded
        const missingIcons = formData.keys.some((_, index) => !keyImages[index]?.src);
        if (missingIcons) {
            Swal.fire({
                title: 'Missing Icon Images!',
                text: 'Please upload icon images for all key points before submitting.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Update keys with uploaded icon images
        const updatedKeys = formData.keys.map((key, index) => ({
            ...key,
            icon: keyImages[index]?.src || key.icon
        }));
        
        const submitData = {
            ...formData,
            bgImg: backgroundImage.src,
            keys: updatedKeys
        };
        updateMutation.mutate(submitData);
    };

    const handleInputChange = (field: keyof UpdateInsightData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleKeyChange = (index: number, field: keyof InsightKey, value: string) => {
        const newKeys = [...formData.keys];
        newKeys[index] = { ...newKeys[index], [field]: value };
        setFormData(prev => ({ ...prev, keys: newKeys }));
    };

    const addKey = () => {
        const newIndex = formData.keys.length;
        setFormData(prev => ({
            ...prev,
            keys: [...prev.keys, { icon: '', text: '' }]
        }));
        setKeyImages(prev => ({
            ...prev,
            [newIndex]: { src: '', alt: '' }
        }));
    };

    const removeKey = (index: number) => {
        if (formData.keys.length > 1) {
            const newKeys = formData.keys.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, keys: newKeys }));
            
            // Remove the corresponding image and reindex
            const newKeyImages: { [key: number]: { src: string; alt: string } } = {};
            Object.keys(keyImages).forEach(key => {
                const keyIndex = parseInt(key);
                if (keyIndex < index) {
                    newKeyImages[keyIndex] = keyImages[keyIndex];
                } else if (keyIndex > index) {
                    newKeyImages[keyIndex - 1] = keyImages[keyIndex];
                }
            });
            setKeyImages(newKeyImages);
        }
    };

    const handleCTAChange = (ctaType: 'cta1' | 'cta2', field: keyof InsightCTA, value: string) => {
        setFormData(prev => ({
            ...prev,
            [ctaType]: { ...prev[ctaType], [field]: value }
        }));
    };

    const handleMediaSelect = (url: string) => {
        if (mediaPickerTarget === 'background') {
            setBackgroundImage({ src: url, alt: '' });
        } else if (typeof mediaPickerTarget === 'number') {
            setKeyImages(prev => ({
                ...prev,
                [mediaPickerTarget]: { src: url, alt: '' }
            }));
        }
        setShowMediaPicker(false);
        setMediaPickerTarget(null);
    };

    const openMediaPicker = (target: 'background' | number) => {
        setMediaPickerTarget(target);
        setShowMediaPicker(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Insight</h2>
                    <p className="text-gray-600">Failed to load insight data. Please try again later.</p>
                    <Link href="/insights" className="btn btn-primary mt-4">
                        Back to Insights
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-5">
            <div className="panel">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Edit Banner Insight</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Update banner insight</p>
                    </div>
                    <Link
                        href="/insights"
                        className="btn btn-outline-primary"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Insights
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Headline *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.headline}
                                onChange={(e) => handleInputChange('headline', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Subheadline *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.subheadline}
                                onChange={(e) => handleInputChange('subheadline', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Highlighted Text *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.highlighted}
                            onChange={(e) => handleInputChange('highlighted', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="form-label mb-0">Background Image *</label>
                            <button
                                type="button"
                                onClick={() => openMediaPicker('background')}
                                className="btn btn-sm btn-outline-primary"
                            >
                                Browse Media Library
                            </button>
                        </div>
                        <ImageUploadField
                            value={backgroundImage}
                            onChange={setBackgroundImage}
                            folder="insights"
                            label=""
                            required
                        />
                    </div>

                    {/* Keys Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="form-label mb-0">Key Points</label>
                            <button
                                type="button"
                                onClick={addKey}
                                className="btn btn-sm btn-primary"
                            >
                                Add Key Point
                            </button>
                        </div>
                        {formData.keys.map((key, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="form-label mb-0">Icon Image *</label>
                                        <button
                                            type="button"
                                            onClick={() => openMediaPicker(index)}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Browse
                                        </button>
                                    </div>
                                    <ImageUploadField
                                        value={keyImages[index] || { src: key.icon, alt: '' }}
                                        onChange={(value) => setKeyImages(prev => ({ ...prev, [index]: value }))}
                                        folder="insights/icons"
                                        label=""
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Text</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Key point text"
                                        value={key.text}
                                        onChange={(e) => handleKeyChange(index, 'text', e.target.value)}
                                        required
                                    />
                                    {formData.keys.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeKey(index)}
                                            className="btn btn-sm btn-outline-danger mt-2"
                                        >
                                            Remove Key Point
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTAs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Call to Action 1 (Link to Insights)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Text</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.cta1.text}
                                        onChange={(e) => handleCTAChange('cta1', 'text', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Link to Insights Detail</label>
                                    <select
                                        className="form-select"
                                        value={formData.cta1.link}
                                        onChange={(e) => handleCTAChange('cta1', 'link', e.target.value)}
                                    >
                                        <option value="">Select an insight...</option>
                                        {insightDetails?.map((detail: any) => (
                                            <option key={detail.id} value={detail.slug || `/insights/${detail.id}`}>
                                                {detail.slug || `/insights/${detail.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Call to Action 2 (Link to Home)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Text</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.cta2.text}
                                        onChange={(e) => handleCTAChange('cta2', 'text', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Link to Home Page</label>
                                    <select
                                        className="form-select"
                                        value={formData.cta2.link}
                                        onChange={(e) => handleCTAChange('cta2', 'link', e.target.value)}
                                    >
                                        <option value="">Select a home page...</option>
                                        {homePages?.map((home: any) => (
                                            <option key={home.id} value={home.slug || `/home/${home.id}`}>
                                                {home.slug || `Home Page ${home.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-6">
                        <Link href="/insights" className="btn btn-outline-secondary">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update Insight'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Media Picker Modal */}
            <MediaPicker
                isOpen={showMediaPicker}
                onClose={() => {
                    setShowMediaPicker(false);
                    setMediaPickerTarget(null);
                }}
                onSelect={handleMediaSelect}
                allowedTypes={['image']}
            />
        </div>
    );
};

export default EditInsightForm;