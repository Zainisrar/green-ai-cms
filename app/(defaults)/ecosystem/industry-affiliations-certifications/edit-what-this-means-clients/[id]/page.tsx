'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemIndustryAffiliationsCertificationsApi } from '@/lib/api/ecosystemIndustryAffiliationsCertifications';
import { EcosystemIndustryAffiliationsCertifications } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';

export default function EditWhatThisMeansClientsPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemIndustryAffiliationsCertifications | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemIndustryAffiliationsCertificationsApi.getById(id);
            setData(result);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setSaving(true);
        setError(null);

        try {
            await ecosystemIndustryAffiliationsCertificationsApi.update(id, {
                whatThisMeansClients: data.whatThisMeansClients
            });
            router.push('/ecosystem/industry-affiliations-certifications');
        } catch (err: any) {
            console.error('Error updating data:', err);
            setError(err.response?.data?.message || 'Failed to update data');
        } finally {
            setSaving(false);
        }
    };

    const updateTitle = (value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatThisMeansClients: {
                ...prev.whatThisMeansClients,
                title: value
            }
        } : null);
    };

    const updateImage = (field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatThisMeansClients: {
                ...prev.whatThisMeansClients,
                img: {
                    ...(prev.whatThisMeansClients.img || { src: '', alt: '' }),
                    [field]: value
                }
            }
        } : null);
    };

    const addKey = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatThisMeansClients: {
                ...prev.whatThisMeansClients,
                keys: [...(prev.whatThisMeansClients.keys || []), { title: '', description: '' }]
            }
        } : null);
    };

    const updateKey = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatThisMeansClients: {
                ...prev.whatThisMeansClients,
                keys: (prev.whatThisMeansClients.keys || []).map((key, i) => 
                    i === index ? { ...key, [field]: value } : key
                )
            }
        } : null);
    };

    const removeKey = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatThisMeansClients: {
                ...prev.whatThisMeansClients,
                keys: (prev.whatThisMeansClients.keys || []).filter((_, i) => i !== index)
            }
        } : null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error: {error || 'Data not found'}</p>
                    <button 
                        onClick={() => router.back()}
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className=" px-4 py-8">
            <div className="">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Edit What This Means for Clients</h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
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
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">What This Means for Clients</h2>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.whatThisMeansClients.title}
                                onChange={(e) => updateTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Image */}
                        <div className="mb-4">
                            <ImageUploadField
                                value={data.whatThisMeansClients.img || { src: '', alt: '' }}
                                onChange={(img) => setData(prev => prev ? {
                                    ...prev,
                                    whatThisMeansClients: {
                                        ...prev.whatThisMeansClients,
                                        img
                                    }
                                } : null)}
                                folder="ecosystem/industry-affiliations-certifications"
                                label="What This Means for Clients Image"
                            />
                        </div>

                        {/* Keys */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Key Benefits for Clients
                                </label>
                                <button
                                    type="button"
                                    onClick={addKey}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Add Key Benefit
                                </button>
                            </div>
                            {data.whatThisMeansClients.keys?.map((key, index) => (
                                <div key={index} className="border border-gray-300 rounded p-4 mb-2">
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            placeholder="Benefit title"
                                            value={key.title}
                                            onChange={(e) => updateKey(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                        />
                                        <textarea
                                            placeholder="Benefit description"
                                            value={key.description}
                                            onChange={(e) => updateKey(index, 'description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeKey(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
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
        </div>
    );
}