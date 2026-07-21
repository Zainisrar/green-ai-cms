'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemOurProcurementPhilosophyApi } from '@/lib/api/ecosystemOurProcurementPhilosophy';
import { EcosystemOurProcurementPhilosophy, ProcurementPhilosophyProcurementAlignedImpact } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function EditProcurementAlignedImpactPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemOurProcurementPhilosophy | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const [formData, setFormData] = useState<ProcurementPhilosophyProcurementAlignedImpact>({
        title: '',
        description: '',
        keys: [''],
        img: { src: '', alt: '' },
        quote: { text: '', highlighted: '' }
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemOurProcurementPhilosophyApi.getById(id);
            setData(result);
            setFormData(result.procurementAlignedImpact);
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
                procurementAlignedImpact: formData
            });
            router.push('/ecosystem/our-procurement-philosophy');
        } catch (err) {
            setError('Failed to update procurement aligned impact');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addKey = () => {
        setFormData(prev => ({
            ...prev,
            keys: [...prev.keys, '']
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
                <h1 className="text-3xl font-bold">Edit Procurement Aligned Impact</h1>
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
                    <h2 className="text-2xl font-semibold mb-4">Procurement Aligned Impact</h2>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md h-32"
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
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Enter key point"
                                        value={key}
                                        onChange={(e) => {
                                            const newKeys = [...formData.keys];
                                            newKeys[index] = e.target.value;
                                            setFormData(prev => ({ ...prev, keys: newKeys }));
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        required
                                    />
                                    {formData.keys.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeKey(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                                <textarea
                                    value={formData.quote.text}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        quote: { ...prev.quote, text: e.target.value }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                                <textarea
                                    value={formData.quote.highlighted}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        quote: { ...prev.quote, highlighted: e.target.value }
                                    }))}
                                    className="w-full p-3 border border-gray-300 rounded-md h-24"
                                    required
                                />
                            </div>
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