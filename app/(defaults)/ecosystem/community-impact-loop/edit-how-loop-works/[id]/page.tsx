'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemCommunityImpactLoopApi } from '@/lib/api/ecosystemCommunityImpactLoop';
import type { EcosystemCommunityImpactLoop, HowLoopWorks, HowLoopWorksItem } from '@/db/schema';

interface Props {
    params: { id: string };
}

export default function EditHowLoopWorks({ params }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EcosystemCommunityImpactLoop | null>(null);

    const [howLoopWorks, setHowLoopWorks] = useState<HowLoopWorks>({
        title: '',
        items: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemCommunityImpactLoopApi.getById(parseInt(params.id));
            setData(result);
            
            // Handle data structure mismatch - convert process array to items array
            const apiData = result.howLoopWorks;
            let items = [];
            
            if (apiData.items) {
                items = apiData.items;
            } else if ((apiData as any).process) {
                // Convert process strings to items with title and empty description
                items = (apiData as any).process.map((processStep: string) => ({
                    title: processStep,
                    description: ''
                }));
            }
            
            setHowLoopWorks({
                title: apiData.title || '',
                items: items
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
            await ecosystemCommunityImpactLoopApi.update(parseInt(params.id), {
                howLoopWorks
            });
            router.push('/ecosystem/community-impact-loop');
        } catch (err) {
            setError('Failed to update how loop works');
            console.error('Error updating data:', err);
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        setHowLoopWorks(prev => ({
            ...prev,
            items: [...prev.items, { title: '', description: '' }]
        }));
    };

    const updateItem = (index: number, field: keyof HowLoopWorksItem, value: string) => {
        setHowLoopWorks(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeItem = (index: number) => {
        setHowLoopWorks(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
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
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit How Loop Works</h1>
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-purple-600">How Loop Works Content</h2>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={howLoopWorks.title}
                            onChange={(e) => setHowLoopWorks(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    {/* Items Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Loop Work Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                Add Item
                            </button>
                        </div>
                        
                        {howLoopWorks.items.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Item {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateItem(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {howLoopWorks.items.length === 0 && (
                            <p className="text-gray-500 text-sm">No items added yet. Click "Add Item" to get started.</p>
                        )}
                    </div>
                </div>

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
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}