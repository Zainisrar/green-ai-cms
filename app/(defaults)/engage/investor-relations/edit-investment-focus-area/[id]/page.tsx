'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface InvestmentFocusAreaData {
    title: string;
    headline: string;
    focusArea: {
        items: string[];
    };
    capitalUse: {
        items: string[];
    };
    returnProfile: {
        items: string[];
    };
}

const EditInvestmentFocusAreaPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState<InvestmentFocusAreaData>({
        title: '',
        headline: '',
        focusArea: { items: [] },
        capitalUse: { items: [] },
        returnProfile: { items: [] },
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/investor-relations/${id}`);
            if (result.success && result.data.investmentFocusArea) {
                setFormData(result.data.investmentFocusArea);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof InvestmentFocusAreaData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addItem = (section: 'focusArea' | 'capitalUse' | 'returnProfile') => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: [...prev[section].items, '']
            }
        }));
    };

    const updateItem = (section: 'focusArea' | 'capitalUse' | 'returnProfile', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: prev[section].items.map((item, i) => i === index ? value : item)
            }
        }));
    };

    const removeItem = (section: 'focusArea' | 'capitalUse' | 'returnProfile', index: number) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: prev[section].items.filter((_, i) => i !== index)
            }
        }));
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
                investmentFocusArea: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Investment Focus Area section updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Investment Focus Area</h5>
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

                    {/* Focus Areas */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Focus Areas</h6>
                            <button
                                type="button"
                                onClick={() => addItem('focusArea')}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Focus Area
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.focusArea.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Focus Area {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeItem('focusArea', index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Focus Area Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="Enter focus area description"
                                            value={item}
                                            onChange={(e) => updateItem('focusArea', index, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {formData.focusArea.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No focus areas added yet. Click "Add Focus Area" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Capital Use */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Capital Use</h6>
                            <button
                                type="button"
                                onClick={() => addItem('capitalUse')}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Capital Use
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.capitalUse.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Capital Use {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeItem('capitalUse', index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Capital Use Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="Enter capital use description"
                                            value={item}
                                            onChange={(e) => updateItem('capitalUse', index, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {formData.capitalUse.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No capital use items added yet. Click "Add Capital Use" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Return Profile */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Return Profile</h6>
                            <button
                                type="button"
                                onClick={() => addItem('returnProfile')}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Return Profile
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.returnProfile.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Return Profile {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeItem('returnProfile', index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Return Profile Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="Enter return profile description"
                                            value={item}
                                            onChange={(e) => updateItem('returnProfile', index, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {formData.returnProfile.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No return profile items added yet. Click "Add Return Profile" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Updating...' : 'Update Investment Focus Area'}
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

export default EditInvestmentFocusAreaPage;