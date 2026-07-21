'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemImpactMeasurementESGApi } from '@/lib/api/ecosystemImpactMeasurementESG';
import { EcosystemImpactMeasurementESG, SampleMetricsSnapshot } from '@/db/schema';

export default function EditSampleMetricsSnapshotPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemImpactMeasurementESG | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<SampleMetricsSnapshot>({
        title: '',
        description: {
            text: '',
            highlighted: ''
        },
        keys: []
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemImpactMeasurementESGApi.getById(id);
            setData(result);
            setFormData(result.sampleMetricsSnapshot);
        } catch (err) {
            setError('Failed to load data');
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
            await ecosystemImpactMeasurementESGApi.update(id, {
                sampleMetricsSnapshot: formData
            });
            router.push('/ecosystem/impact-measurement-esg');
        } catch (err) {
            setError('Failed to update data');
            console.error('Error updating data:', err);
        } finally {
            setSaving(false);
        }
    };

    const addKey = () => {
        setFormData(prev => ({
            ...prev,
            keys: [...prev.keys, { text: '', highlighted: '' }]
        }));
    };

    const removeKey = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keys: prev.keys.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Data not found
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-8">
            <div className="max-w-none">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Sample Metrics Snapshot
                    </h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        Back
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-none space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Metrics Snapshot Content</h2>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description Text
                                </label>
                                <textarea
                                    value={formData.description.text}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: { ...prev.description, text: e.target.value }
                                    }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description Highlighted
                                </label>
                                <input
                                    type="text"
                                    value={formData.description.highlighted}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: { ...prev.description, highlighted: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Metrics Key Points
                                </label>
                                <button
                                    type="button"
                                    onClick={addKey}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    Add Key Point
                                </button>
                            </div>
                            {formData.keys.map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Metric Key Point Text"
                                        value={key.text}
                                        onChange={(e) => {
                                            const newKeys = [...formData.keys];
                                            newKeys[index].text = e.target.value;
                                            setFormData(prev => ({ ...prev, keys: newKeys }));
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Highlighted Text (optional)"
                                        value={key.highlighted}
                                        onChange={(e) => {
                                            const newKeys = [...formData.keys];
                                            newKeys[index].highlighted = e.target.value;
                                            setFormData(prev => ({ ...prev, keys: newKeys }));
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeKey(index)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
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
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
                        >
                            {saving ? '💾 Saving...' : '✅ Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}