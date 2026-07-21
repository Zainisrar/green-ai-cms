'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useImageUpload } from '@/hooks/useImageUpload';

interface InvestmentInstrumentsData {
    title: string;
    headline: string;
    key: Array<{
        icon: {
            src: string;
            alt: string;
        };
        text: string;
    }>;
    quote: {
        text: string;
        highlighted: string;
    };
}

const EditInvestmentInstrumentsPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { uploadImage, isUploading, uploadError } = useImageUpload();
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    
    const [formData, setFormData] = useState<InvestmentInstrumentsData>({
        title: '',
        headline: '',
        key: [],
        quote: { text: '', highlighted: '' },
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/investor-relations/${id}`);
            if (result.success && result.data.investmentInstruments) {
                setFormData(result.data.investmentInstruments);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof InvestmentInstrumentsData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleQuoteChange = (field: 'text' | 'highlighted', value: string) => {
        setFormData(prev => ({
            ...prev,
            quote: { ...prev.quote, [field]: value }
        }));
    };

    const addKey = () => {
        setFormData(prev => ({
            ...prev,
            key: [...prev.key, { icon: { src: '', alt: '' }, text: '' }]
        }));
    };

    const updateKey = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            key: prev.key.map((item, i) => {
                if (i === index) {
                    if (field === 'iconSrc') {
                        return { ...item, icon: { ...item.icon, src: value } };
                    } else if (field === 'iconAlt') {
                        return { ...item, icon: { ...item.icon, alt: value } };
                    } else {
                        return { ...item, [field]: value };
                    }
                }
                return item;
            })
        }));
    };

    const removeKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            key: prev.key.filter((_, i) => i !== index)
        }));
    };

    const handleIconUpload = async (index: number, file: File) => {
        setUploadingIndex(index);
        try {
            const result = await uploadImage(file, 'investor-relations/icons');
            if (result) {
                updateKey(index, 'iconSrc', result.url);
            }
        } catch (error) {
            console.error('Image upload error:', error);
            Swal.fire('Error', 'Failed to upload icon', 'error');
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveIcon = (index: number) => {
        updateKey(index, 'iconSrc', '');
        updateKey(index, 'iconAlt', '');
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.headline.trim()) {
            newErrors.headline = 'Headline is required';
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
            const result = await apiClient.patch(`/api/engage/investor-relations/${id}`, {
                investmentInstruments: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Investment Instruments section updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                }).then(() => {
                    router.push('/engage/investor-relations');
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
                            onClick={() => router.push('/engage/investor-relations')}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Investment Instruments</h5>
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
                                <label className="block text-sm font-medium mb-2">Headline *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter headline"
                                    value={formData.headline}
                                    onChange={(e) => handleInputChange('headline', e.target.value)}
                                />
                                {errors.headline && <p className="text-red-500 text-sm mt-1">{errors.headline}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Investment Instruments */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Investment Instruments</h6>
                            <button
                                type="button"
                                onClick={addKey}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Instrument
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.key.map((instrument, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Instrument {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeKey(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Upload Icon</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="form-input"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleIconUpload(index, file);
                                                    }
                                                }}
                                                disabled={uploadingIndex === index}
                                            />
                                            {uploadingIndex === index && (
                                                <p className="text-blue-500 text-sm mt-1">Uploading icon...</p>
                                            )}
                                            {uploadError && uploadingIndex === index && (
                                                <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                                            )}
                                            
                                            {/* Icon Preview */}
                                            {instrument.icon.src && (
                                                <div className="mt-4 relative inline-block">
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <img
                                                            src={instrument.icon.src}
                                                            alt={instrument.icon.alt || 'Icon preview'}
                                                            className="h-16 w-16 object-contain"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveIcon(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                        title="Remove Icon"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Icon Alt Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Alt text for accessibility"
                                                value={instrument.icon.alt}
                                                onChange={(e) => updateKey(index, 'iconAlt', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="Enter instrument description"
                                            value={instrument.text}
                                            onChange={(e) => updateKey(index, 'text', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {formData.key.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No instruments added yet. Click "Add Instrument" to get started.</p>
                                </div>
                            )}
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
                                    onChange={(e) => handleQuoteChange('text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Text to highlight in the quote"
                                    value={formData.quote.highlighted}
                                    onChange={(e) => handleQuoteChange('highlighted', e.target.value)}
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
                            {loading ? 'Updating...' : 'Update Investment Instruments'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/engage/investor-relations')}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
};

export default EditInvestmentInstrumentsPage;