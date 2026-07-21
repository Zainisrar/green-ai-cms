'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemOurProcurementPhilosophyApi } from '@/lib/api/ecosystemOurProcurementPhilosophy';
import { EcosystemOurProcurementPhilosophy, ProcurementPhilosophyCorePrinciples } from '@/db/schema';

export default function EditCorePrinciplesProcurementPhilosophyPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemOurProcurementPhilosophy | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProcurementPhilosophyCorePrinciples>({
        title: '',
        subHeadline: '',
        items: [{ principle: '', statement: '' }]
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemOurProcurementPhilosophyApi.getById(id);
            setData(result);
            setFormData(result.corePrinciples);
        } catch (err) {
            setError('Failed to load procurement philosophy data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await ecosystemOurProcurementPhilosophyApi.update(id, {
                corePrinciples: formData
            });
            router.push('/ecosystem/our-procurement-philosophy');
        } catch (err) {
            setError('Failed to update core principles');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addPrinciple = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { principle: '', statement: '' }]
        }));
    };

    const removePrinciple = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Core Principles - Procurement Philosophy</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Core Principles</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Headline</label>
                            <input
                                type="text"
                                value={formData.subHeadline}
                                onChange={(e) => setFormData(prev => ({ ...prev, subHeadline: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        {/* Principles */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Principles</label>
                                <button
                                    type="button"
                                    onClick={addPrinciple}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Principle
                                </button>
                            </div>
                            {formData.items.map((item, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Principle {index + 1}</span>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePrinciple(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Principle</label>
                                            <input
                                                type="text"
                                                placeholder="Enter principle name"
                                                value={item.principle}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].principle = e.target.value;
                                                    setFormData(prev => ({ ...prev, items: newItems }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Statement</label>
                                            <textarea
                                                placeholder="Enter principle statement"
                                                value={item.statement}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].statement = e.target.value;
                                                    setFormData(prev => ({ ...prev, items: newItems }));
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded h-24"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}