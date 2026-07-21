'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EcosystemSupplyPartners } from '@/db/schema';

export default function EditHowBecomeGreenSupplierPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        subHeadline: '',
        item: [] as { step: string; action: string }[]
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ecosystem/supply-partners/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data: EcosystemSupplyPartners = await response.json();
            
            setFormData(data.howBecomeGreenSupplier);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // First get the current data
            const currentResponse = await fetch(`/api/ecosystem/supply-partners/${id}`);
            if (!currentResponse.ok) {
                throw new Error('Failed to fetch current data');
            }
            const currentData: EcosystemSupplyPartners = await currentResponse.json();

            // Update only the howBecomeGreenSupplier section
            const updateData = {
                ...currentData,
                howBecomeGreenSupplier: formData
            };

            const response = await fetch(`/api/ecosystem/supply-partners/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Failed to update data');
            }

            router.push('/ecosystem/supply-partners');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            item: [...prev.item, { step: '', action: '' }]
        }));
    };

    const updateStep = (index: number, field: 'step' | 'action', value: string) => {
        setFormData(prev => ({
            ...prev,
            item: prev.item.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            item: prev.item.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Edit How to Become Green Supplier
                </h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
                {/* Basic Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Section Information</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Sub Headline *
                        </label>
                        <input
                            type="text"
                            value={formData.subHeadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, subHeadline: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Steps */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Steps to Become a Supplier</h2>
                        <button
                            type="button"
                            onClick={addStep}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Step
                        </button>
                    </div>

                    {formData.item.map((item, index) => (
                        <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Step {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Step Number/Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={item.step}
                                        onChange={(e) => updateStep(index, 'step', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Step 1, Registration, etc."
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Action Required *
                                    </label>
                                    <textarea
                                        value={item.action}
                                        onChange={(e) => updateStep(index, 'action', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe what the supplier needs to do in this step..."
                                        rows={3}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {formData.item.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No steps added yet. Click "Add Step" to get started.
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}