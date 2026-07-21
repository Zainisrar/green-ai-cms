'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemImpactMeasurementESGApi } from '@/lib/api/ecosystemImpactMeasurementESG';
import { EcosystemImpactMeasurementESG, HowWeMeasureImpact } from '@/db/schema';

export default function EditHowWeMeasureImpactPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemImpactMeasurementESG | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<HowWeMeasureImpact>({
        metrics: [],
        quote: {
            text: '',
            highlighted: ''
        }
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemImpactMeasurementESGApi.getById(id);
            setData(result);
            // Handle case where howWeMeasureImpact might not exist in old data
            setFormData(result.howWeMeasureImpact || {
                metrics: [],
                quote: {
                    text: '',
                    highlighted: ''
                }
            });
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
                howWeMeasureImpact: formData
            });
            router.push('/ecosystem/impact-measurement-esg');
        } catch (err) {
            setError('Failed to update data');
            console.error('Error updating data:', err);
        } finally {
            setSaving(false);
        }
    };

    const addMetric = () => {
        setFormData(prev => ({
            ...prev,
            metrics: [...prev.metrics, { category: '', keyMetricsTracked: '' }]
        }));
    };

    const removeMetric = (index: number) => {
        setFormData(prev => ({
            ...prev,
            metrics: prev.metrics.filter((_, i) => i !== index)
        }));
    };

    const updateMetric = (index: number, field: 'category' | 'keyMetricsTracked', value: string) => {
        setFormData(prev => ({
            ...prev,
            metrics: prev.metrics.map((metric, i) => 
                i === index ? { ...metric, [field]: value } : metric
            )
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
                        Edit How We Measure Impact - Impact Measurement ESG
                    </h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        ← Back
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-none space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Measure Impact</h2>
                        
                        {/* Metrics Section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Impact Metrics
                                </label>
                                <button
                                    type="button"
                                    onClick={addMetric}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
                                >
                                    + Add Metric
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.metrics.map((metric, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-sm font-medium text-gray-700">Metric #{index + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeMetric(index)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Category
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Environmental Impact"
                                                    value={metric.category}
                                                    onChange={(e) => updateMetric(index, 'category', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Key Metrics Tracked
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., CO2 reduction, energy savings"
                                                    value={metric.keyMetricsTracked}
                                                    onChange={(e) => updateMetric(index, 'keyMetricsTracked', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {formData.metrics.length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <p className="text-gray-500 mb-3">No metrics added yet</p>
                                        <button
                                            type="button"
                                            onClick={addMetric}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Add Your First Metric
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quote Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quote Text
                                    </label>
                                    <textarea
                                        value={formData.quote.text}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            quote: { ...prev.quote, text: e.target.value }
                                        }))}
                                        rows={4}
                                        placeholder="Enter the main quote text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quote Highlighted Text
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.quote.highlighted}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            quote: { ...prev.quote, highlighted: e.target.value }
                                        }))}
                                        placeholder="Optional highlighted portion"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This text will be highlighted in green
                                    </p>
                                </div>
                            </div>
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
