'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EcosystemSupplyPartners } from '@/db/schema';

export default function EditGlobalSourcingStrategyPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        headline: '',
        description: '',
        keyPoints: [] as string[]
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
            
            setFormData(data.globalSourcingStrategy);
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

            // Update only the globalSourcingStrategy section
            const updateData = {
                ...currentData,
                globalSourcingStrategy: formData
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

    const addKeyPoint = () => {
        setFormData(prev => ({
            ...prev,
            keyPoints: [...prev.keyPoints, '']
        }));
    };

    const updateKeyPoint = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.map((point, i) => 
                i === index ? value : point
            )
        }));
    };

    const removeKeyPoint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keyPoints: prev.keyPoints.filter((_, i) => i !== index)
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
                    Edit Global Sourcing Strategy
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
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Strategy Information</h2>
                    
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
                            Headline *
                        </label>
                        <input
                            type="text"
                            value={formData.headline}
                            onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                        />
                    </div>
                </div>

                {/* Key Points */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Key Points</h2>
                        <button
                            type="button"
                            onClick={addKeyPoint}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Add Key Point
                        </button>
                    </div>

                    {formData.keyPoints.map((point, index) => (
                        <div key={index} className="border border-gray-300 rounded-md p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium">Key Point {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeKeyPoint(index)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Point Text
                                </label>
                                <textarea
                                    value={point}
                                    onChange={(e) => updateKeyPoint(index, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Enter key point..."
                                />
                            </div>
                        </div>
                    ))}

                    {formData.keyPoints.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No key points added yet. Click "Add Key Point" to get started.
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