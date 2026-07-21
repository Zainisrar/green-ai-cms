'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemHandbookApi } from '@/lib/api/ecosystemHandbook';
import type { EcosystemHandbook } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';

export default function EditEcosystemHandbookModals() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [data, setData] = useState<EcosystemHandbook | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setFetchLoading(true);
            const result = await ecosystemHandbookApi.getById(id);
            setData(result);
        } catch (error) {
            console.error('Error fetching ecosystem handbook:', error);
            alert('Failed to load ecosystem handbook data');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setLoading(true);
        try {
            await ecosystemHandbookApi.update(id, {
                ourProcurementEthos: data.ourProcurementEthos,
                codeOfConduct: data.codeOfConduct
            });
            router.push('/ecosystem/handbook');
        } catch (error) {
            console.error('Error updating ecosystem handbook:', error);
            alert('Failed to update ecosystem handbook');
        } finally {
            setLoading(false);
        }
    };

    const addEthosKey = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourProcurementEthos: {
                ...prev.ourProcurementEthos,
                keys: [...prev.ourProcurementEthos.keys, '']
            }
        } : null);
    };

    const removeEthosKey = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourProcurementEthos: {
                ...prev.ourProcurementEthos,
                keys: prev.ourProcurementEthos.keys.filter((_, i) => i !== index)
            }
        } : null);
    };

    const updateEthosKey = (index: number, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourProcurementEthos: {
                ...prev.ourProcurementEthos,
                keys: prev.ourProcurementEthos.keys.map((key, i) => 
                    i === index ? value : key
                )
            }
        } : null);
    };

    const addConductItem = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            codeOfConduct: {
                ...prev.codeOfConduct,
                item: [...prev.codeOfConduct.item, { category: '', requiredStandard: '' }]
            }
        } : null);
    };

    const removeConductItem = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            codeOfConduct: {
                ...prev.codeOfConduct,
                item: prev.codeOfConduct.item.filter((_, i) => i !== index)
            }
        } : null);
    };

    const updateConductItem = (index: number, field: 'category' | 'requiredStandard', value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            codeOfConduct: {
                ...prev.codeOfConduct,
                item: prev.codeOfConduct.item.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }
        } : null);
    };

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">Ecosystem handbook not found</div>
            </div>
        );
    }

    return (
        <div className=" px-4 py-8">
            <div className="">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Modals - Ecosystem Handbook</h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Our Procurement Ethos Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Our Procurement Ethos</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.ourProcurementEthos.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        ourProcurementEthos: { ...prev.ourProcurementEthos, title: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={data.ourProcurementEthos.description}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        ourProcurementEthos: { ...prev.ourProcurementEthos, description: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <ImageUploadField
                                    value={data.ourProcurementEthos.img || { src: '', alt: '' }}
                                    onChange={(img) => setData(prev => prev ? {
                                        ...prev,
                                        ourProcurementEthos: { ...prev.ourProcurementEthos, img }
                                    } : null)}
                                    folder="ecosystem/handbook"
                                    label="Procurement Ethos Image"
                                />
                            </div>

                            {/* Keys */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Key Points
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addEthosKey}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Add Key
                                    </button>
                                </div>
                                {data.ourProcurementEthos.keys.map((key, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Key point"
                                            value={key}
                                            onChange={(e) => updateEthosKey(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeEthosKey(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Code of Conduct Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Code of Conduct</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.codeOfConduct.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        codeOfConduct: { ...prev.codeOfConduct, title: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Conduct Items */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Conduct Items
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addConductItem}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Add Item
                                    </button>
                                </div>
                                {data.codeOfConduct.item.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded p-4 mb-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeConductItem(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Category"
                                                value={item.category}
                                                onChange={(e) => updateConductItem(index, 'category', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <textarea
                                                placeholder="Required standard"
                                                rows={3}
                                                value={item.requiredStandard}
                                                onChange={(e) => updateConductItem(index, 'requiredStandard', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
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
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Modals'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}