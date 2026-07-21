'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemCommunityImpactLoopApi } from '@/lib/api/ecosystemCommunityImpactLoop';
import type { EcosystemCommunityImpactLoop } from '@/db/schema';

// Custom interface to match actual API data structure
interface ActualGreenCommunityImpactLoop {
    title: string;
    description: string;
    steps?: string[];
}

interface Props {
    params: { id: string };
}

export default function EditGreenCommunityImpactLoop({ params }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EcosystemCommunityImpactLoop | null>(null);

    const [greenCommunityImpactLoop, setGreenCommunityImpactLoop] = useState<ActualGreenCommunityImpactLoop>({
        title: '',
        description: '',
        steps: [],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemCommunityImpactLoopApi.getById(parseInt(params.id));
            setData(result);
            // Transform the data to match the actual API structure
            const apiData = result.greenCommunityImpactLoop;

            // Handle description - it could be a string or an object with text1/text2
            let description = '';
            if (typeof apiData.description === 'string') {
                description = apiData.description;
            } else if (apiData.description && typeof apiData.description === 'object') {
                // If it's an object, use text1 or combine text1 and text2
                const desc = apiData.description as any;
                description = desc.text1 || desc.text2 || '';
            }

            setGreenCommunityImpactLoop({
                title: apiData.title || '',
                description: description,
                steps: apiData.keys || [],
            });
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Transform the data to match the API schema
            const apiData = {
                title: greenCommunityImpactLoop.title,
                description: {
                    text1: greenCommunityImpactLoop.description,
                    text2: '',
                },
                keys: greenCommunityImpactLoop.steps || [],
            };

            await ecosystemCommunityImpactLoopApi.update(parseInt(params.id), {
                greenCommunityImpactLoop: apiData,
            });
            router.push('/ecosystem/community-impact-loop');
        } catch (err) {
            setError('Failed to update green community impact loop');
            console.error('Error updating data:', err);
        } finally {
            setSaving(false);
        }
    };

    const addStep = () => {
        setGreenCommunityImpactLoop((prev) => ({
            ...prev,
            steps: [...(prev.steps || []), ''],
        }));
    };

    const updateStep = (index: number, value: string) => {
        setGreenCommunityImpactLoop((prev) => ({
            ...prev,
            steps: (prev.steps || []).map((step, i) => (i === index ? value : step)),
        }));
    };

    const removeStep = (index: number) => {
        setGreenCommunityImpactLoop((prev) => ({
            ...prev,
            steps: (prev.steps || []).filter((_, i) => i !== index),
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Green Community Impact Loop</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                    ← Back
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="max-w-none space-y-6">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <h2 className="text-xl font-semibold mb-4 text-green-600">Green Community Impact Loop Content</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={greenCommunityImpactLoop.title}
                                onChange={(e) => setGreenCommunityImpactLoop((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={greenCommunityImpactLoop.description}
                                onChange={(e) =>
                                    setGreenCommunityImpactLoop((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Steps Section */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Steps</h3>
                            <button
                                type="button"
                                onClick={addStep}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                Add Step
                            </button>
                        </div>

                        {greenCommunityImpactLoop.steps?.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={step}
                                    onChange={(e) => updateStep(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder={`Step ${index + 1}`}
                                    required
                                />
                            </div>
                        ))}

                        {(!greenCommunityImpactLoop.steps || greenCommunityImpactLoop.steps.length === 0) && (
                            <p className="text-gray-500 text-sm">No steps added yet. Click "Add Step" to get started.</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
                    >
                        {saving ? '💾 Saving...' : '✅ Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
