'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemOurProcurementPhilosophyApi } from '@/lib/api/ecosystemOurProcurementPhilosophy';
import { EcosystemOurProcurementPhilosophy, ProcurementPhilosophyStrategicVendorRelationships } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function EditStrategicVendorRelationshipsPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemOurProcurementPhilosophy | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const [formData, setFormData] = useState<ProcurementPhilosophyStrategicVendorRelationships>({
        title: '',
        keys: [{ text: '', highlighted: '' }],
        img: { src: '', alt: '' }
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemOurProcurementPhilosophyApi.getById(id);
            setData(result);
            setFormData(result.strategicVendorRelationships);
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
                strategicVendorRelationships: formData
            });
            router.push('/ecosystem/our-procurement-philosophy');
        } catch (err) {
            setError('Failed to update strategic vendor relationships');
            console.error(err);
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Strategic Vendor Relationships</h1>
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
                    <h2 className="text-2xl font-semibold mb-4">Strategic Vendor Relationships</h2>
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
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Key Points</label>
                                <button
                                    type="button"
                                    onClick={addKey}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {formData.keys.map((key, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">Key {index + 1}</span>
                                        {formData.keys.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeKey(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Key text"
                                            value={key.text}
                                            onChange={(e) => {
                                                const newKeys = [...formData.keys];
                                                newKeys[index].text = e.target.value;
                                                setFormData(prev => ({ ...prev, keys: newKeys }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Highlighted text"
                                            value={key.highlighted}
                                            onChange={(e) => {
                                                const newKeys = [...formData.keys];
                                                newKeys[index].highlighted = e.target.value;
                                                setFormData(prev => ({ ...prev, keys: newKeys }));
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <ImageUploadField
                            value={formData.img}
                            onChange={(img) => setFormData(prev => ({ 
                                ...prev, 
                                img: img
                            }))}
                            folder="ecosystem/procurement-philosophy"
                            label="Image"
                        />
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                            Browse Media Library
                        </button>
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

            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    allowedTypes={['image']}
                    onSelect={(media) => {
                        setFormData(prev => ({
                            ...prev,
                            img: { src: media, alt: '' }
                        }));
                        setShowMediaPicker(false);
                    }}
                    onClose={() => setShowMediaPicker(false)}
                />
            )}
        </div>
    );
}