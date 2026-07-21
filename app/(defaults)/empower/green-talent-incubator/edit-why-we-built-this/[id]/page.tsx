'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface WhyWeBuiltThisFormData {
    title: string;
    description: string;
    key: {
        title: string;
        items: string[];
    };
    quote: {
        text: string;
        highlighted: string;
    };
}

const EditWhyWeBuiltThisPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otherData, setOtherData] = useState<any>(null);

    const [formData, setFormData] = useState<WhyWeBuiltThisFormData>({
        title: '',
        description: '',
        key: { title: '', items: [] },
        quote: { text: '', highlighted: '' },
    });

    useEffect(() => {
        if (id) {
            fetchGreenTalentData();
        }
    }, [id]);

    const fetchGreenTalentData = async () => {
        try {
            const result = await apiClient.get(`/api/empower/green-talent-incubator/${id}`);
            if (result.success) {
                const data = result.data;
                setFormData({
                    title: data.modals.whyWeBuiltThis.title || '',
                    description: data.modals.whyWeBuiltThis.description || '',
                    key: data.modals.whyWeBuiltThis.key || { title: '', items: [] },
                    quote: data.modals.whyWeBuiltThis.quote || { text: '', highlighted: '' },
                });
                setOtherData({
                    mainPage: data.mainPage,
                    modals: {
                        ...data.modals,
                        whyWeBuiltThis: undefined, // We'll replace this with our form data
                    },
                });
            } else {
                Swal.fire('Error', 'Failed to fetch green talent incubator data', 'error');
                router.push('/empower/green-talent-incubator');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error', 'Failed to fetch green talent incubator data', 'error');
            router.push('/empower/green-talent-incubator');
        } finally {
            setFetchingData(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleNestedChange = (parent: keyof WhyWeBuiltThisFormData, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent] as any, [field]: value },
        }));
    };

    const addKeyItem = () => {
        setFormData((prev) => ({
            ...prev,
            key: {
                ...prev.key,
                items: [...prev.key.items, ''],
            },
        }));
    };

    const updateKeyItem = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            key: {
                ...prev.key,
                items: prev.key.items.map((item, i) => (i === index ? value : item)),
            },
        }));
    };

    const removeKeyItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            key: {
                ...prev.key,
                items: prev.key.items.filter((_, i) => i !== index),
            },
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
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
            const payload = {
                mainPage: otherData.mainPage,
                modals: {
                    ...otherData.modals,
                    whyWeBuiltThis: formData,
                },
            };

            const result = await apiClient.put(`/api/empower/green-talent-incubator/${id}`, payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Why We Built This modal updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK',
                }).then(() => {
                    router.push('/empower/green-talent-incubator');
                });
            } else {
                Swal.fire('Error', result.error || 'Failed to update modal', 'error');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire('Error', error.message || 'Failed to update modal', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="btn btn-outline-primary btn-sm border-green-600 text-green-600 hover:bg-green-600"
                        >
                            <IconArrowBackward className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit "Why We Built This" Modal</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter modal title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description *</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Enter modal description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Key Section */}
                    <div>
                        <h6 className="text-lg font-semibold mb-4">Key Section</h6>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Key Title</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter key section title"
                                value={formData.key.title}
                                onChange={(e) => handleNestedChange('key', 'title', e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium">Key Items</label>
                                <button
                                    type="button"
                                    onClick={addKeyItem}
                                    className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                                >
                                    Add Item
                                </button>
                            </div>
                            
                            {formData.key.items.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No key items added yet. Click "Add Item" to create one.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.key.items.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="form-input flex-1"
                                                placeholder={`Key item ${index + 1}`}
                                                value={item}
                                                onChange={(e) => updateKeyItem(index, e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeKeyItem(index)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Remove Item"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quote */}
                    <div>
                        <h6 className="text-lg font-semibold mb-4">Quote</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quote Text</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
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
                                    placeholder="Highlighted part"
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
                            {loading ? 'Saving...' : 'Save Modal'}
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
            </div>
        </ProtectedRoute>
    );
};

export default EditWhyWeBuiltThisPage;