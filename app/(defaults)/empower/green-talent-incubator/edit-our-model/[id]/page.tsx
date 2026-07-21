'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

interface OurModelKey {
    title: string;
    description: string;
}

interface OurModelFormData {
    title: {
        step1: string;
        step2: string;
        step3: string;
    };
    description: string;
    key: OurModelKey[];
    quote: {
        text: string;
        highlighted: string;
    };
}

const EditOurModelPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otherData, setOtherData] = useState<any>(null);

    const [formData, setFormData] = useState<OurModelFormData>({
        title: { step1: '', step2: '', step3: '' },
        description: '',
        key: [],
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
                    title: data.modals.ourModel.title || { step1: '', step2: '', step3: '' },
                    description: data.modals.ourModel.description || '',
                    key: data.modals.ourModel.key || [],
                    quote: data.modals.ourModel.quote || { text: '', highlighted: '' },
                });
                setOtherData({
                    mainPage: data.mainPage,
                    modals: {
                        ...data.modals,
                        ourModel: undefined,
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

    const handleTitleChange = (step: 'step1' | 'step2' | 'step3', value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: { ...prev.title, [step]: value },
        }));
    };

    const handleQuoteChange = (field: 'text' | 'highlighted', value: string) => {
        setFormData((prev) => ({
            ...prev,
            quote: { ...prev.quote, [field]: value },
        }));
    };

    const addKey = () => {
        setFormData((prev) => ({
            ...prev,
            key: [...prev.key, { title: '', description: '' }],
        }));
    };

    const updateKey = (index: number, field: 'title' | 'description', value: string) => {
        setFormData((prev) => ({
            ...prev,
            key: prev.key.map((k, i) => (i === index ? { ...k, [field]: value } : k)),
        }));
    };

    const removeKey = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            key: prev.key.filter((_, i) => i !== index),
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

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
                    ourModel: formData,
                },
            };

            const result = await apiClient.put(`/api/empower/green-talent-incubator/${id}`, payload);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Our Model modal updated successfully',
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
                        <h5 className="font-semibold text-lg dark:text-white-light">Edit "Our Model" Modal</h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Steps Title */}
                    <div>
                        <h6 className="text-lg font-semibold mb-4">Model Steps</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Step 1</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter step 1"
                                    value={formData.title.step1}
                                    onChange={(e) => handleTitleChange('step1', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Step 2</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter step 2"
                                    value={formData.title.step2}
                                    onChange={(e) => handleTitleChange('step2', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Step 3</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter step 3"
                                    value={formData.title.step3}
                                    onChange={(e) => handleTitleChange('step3', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            placeholder="Enter model description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Key Points */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Key Points</h6>
                            <button
                                type="button"
                                onClick={addKey}
                                className="btn btn-sm btn-outline-primary border-green-600 text-green-600 hover:bg-green-600"
                            >
                                Add Key Point
                            </button>
                        </div>

                        {formData.key.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                No key points added yet. Click "Add Key Point" to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.key.map((item, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-medium">Key Point #{index + 1}</h6>
                                            <button
                                                type="button"
                                                onClick={() => removeKey(index)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Remove Key Point"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Key point title"
                                                    value={item.title}
                                                    onChange={(e) => updateKey(index, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Description</label>
                                                <textarea
                                                    className="form-textarea"
                                                    rows={2}
                                                    placeholder="Key point description"
                                                    value={item.description}
                                                    onChange={(e) => updateKey(index, 'description', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    onChange={(e) => handleQuoteChange('text', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Highlighted Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Highlighted part"
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

export default EditOurModelPage;
