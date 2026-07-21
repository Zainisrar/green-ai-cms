'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface PerformanceSnapshotsData {
    title: string;
    headline: string;
    metric: {
        items: string[];
    };
    value: {
        items: string[];
    };
}

const EditPerformanceSnapshotsPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState<PerformanceSnapshotsData>({
        title: '',
        headline: '',
        metric: { items: [] },
        value: { items: [] },
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const result = await apiClient.get(`/api/engage/investor-relations/${id}`);
            if (result.success && result.data.performanceSnapshots) {
                setFormData(result.data.performanceSnapshots);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (field: keyof PerformanceSnapshotsData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addItem = (section: 'metric' | 'value') => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: [...prev[section].items, '']
            }
        }));
    };

    const updateItem = (section: 'metric' | 'value', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: prev[section].items.map((item, i) => i === index ? value : item)
            }
        }));
    };

    const removeItem = (section: 'metric' | 'value', index: number) => {
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
                performanceSnapshots: formData
            });

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Performance Snapshots section updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit Performance Snapshots</h5>
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

                    {/* Metrics */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Metrics</h6>
                            <button
                                type="button"
                                onClick={() => addItem('metric')}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Metric
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.metric.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Metric {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeItem('metric', index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Metric Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter metric name (e.g., Total Assets Under Management)"
                                            value={item}
                                            onChange={(e) => updateItem('metric', index, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {formData.metric.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No metrics added yet. Click "Add Metric" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Values */}
                    <div className="panel">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Values</h6>
                            <button
                                type="button"
                                onClick={() => addItem('value')}
                                className="btn btn-primary btn-sm bg-green-600 hover:bg-green-700 border-green-600"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Value
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.value.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="font-medium">Value {index + 1}</h6>
                                        <button
                                            type="button"
                                            onClick={() => removeItem('value', index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Value</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter value (e.g., $2.5B, 15.2%, 250+ projects)"
                                            value={item}
                                            onChange={(e) => updateItem('value', index, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {formData.value.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No values added yet. Click "Add Value" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> Metrics and values should correspond to each other. The first metric should match the first value, second metric with second value, and so on.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {loading ? 'Updating...' : 'Update Performance Snapshots'}
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

export default EditPerformanceSnapshotsPage;