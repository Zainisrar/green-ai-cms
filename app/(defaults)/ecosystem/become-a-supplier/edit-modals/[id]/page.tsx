'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ecosystemBecomeSupplierApi } from '@/lib/api/ecosystemBecomeSupplier';
import { EcosystemBecomeSupplier, EcosystemBecomeSupplierWhatYouNeed, EcosystemBecomeSupplierWhyGreen } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function EditModalsBecomeSupplierPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const [data, setData] = useState<EcosystemBecomeSupplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const [whatYouNeedData, setWhatYouNeedData] = useState<EcosystemBecomeSupplierWhatYouNeed>({
        title: '',
        keys: ['']
    });

    const [whyGreenData, setWhyGreenData] = useState<EcosystemBecomeSupplierWhyGreen>({
        title: '',
        img: { src: '', alt: '' },
        keys: ['']
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemBecomeSupplierApi.getById(id);
            setData(result);
            setWhatYouNeedData({
                title: result.whatYouNeed?.title || '',
                keys: result.whatYouNeed?.keys || ['']
            });
            setWhyGreenData({
                title: result.whyGreen?.title || '',
                img: result.whyGreen?.img || { src: '', alt: '' },
                keys: result.whyGreen?.keys || ['']
            });
        } catch (err) {
            setError('Failed to load become a supplier data');
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
            await ecosystemBecomeSupplierApi.update(id, {
                whatYouNeed: whatYouNeedData,
                whyGreen: whyGreenData
            });
            router.push('/ecosystem/become-a-supplier');
        } catch (err) {
            setError('Failed to update modals');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addWhatYouNeedKey = () => {
        setWhatYouNeedData(prev => ({
            ...prev,
            keys: [...(prev.keys || []), '']
        }));
    };

    const removeWhatYouNeedKey = (index: number) => {
        setWhatYouNeedData(prev => ({
            ...prev,
            keys: (prev.keys || []).filter((_, i) => i !== index)
        }));
    };

    const addWhyGreenKey = () => {
        setWhyGreenData(prev => ({
            ...prev,
            keys: [...(prev.keys || []), '']
        }));
    };

    const removeWhyGreenKey = (index: number) => {
        setWhyGreenData(prev => ({
            ...prev,
            keys: (prev.keys || []).filter((_, i) => i !== index)
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
                <h1 className="text-3xl font-bold">Edit Modals - Become a Supplier</h1>
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
                {/* What You Need Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">What You Need</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={whatYouNeedData.title}
                                onChange={(e) => setWhatYouNeedData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Keys</label>
                                <button
                                    type="button"
                                    onClick={addWhatYouNeedKey}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {(whatYouNeedData.keys || []).map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Enter key point"
                                        value={key}
                                        onChange={(e) => {
                                            const newKeys = [...(whatYouNeedData.keys || [])];
                                            newKeys[index] = e.target.value;
                                            setWhatYouNeedData(prev => ({ ...prev, keys: newKeys }));
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        required
                                    />
                                    {(whatYouNeedData.keys || []).length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWhatYouNeedKey(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Why Green Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Why Green</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={whyGreenData.title}
                                onChange={(e) => setWhyGreenData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        
                        <ImageUploadField
                            value={whyGreenData.img}
                            onChange={(img) => setWhyGreenData(prev => ({
                                ...prev,
                                img: img
                            }))}
                            folder="ecosystem/become-a-supplier"
                            label="Image"
                        />
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                            Browse Media Library
                        </button>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Keys</label>
                                <button
                                    type="button"
                                    onClick={addWhyGreenKey}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                    Add Key
                                </button>
                            </div>
                            {(whyGreenData.keys || []).map((key, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Enter key point"
                                        value={key}
                                        onChange={(e) => {
                                            const newKeys = [...(whyGreenData.keys || [])];
                                            newKeys[index] = e.target.value;
                                            setWhyGreenData(prev => ({ ...prev, keys: newKeys }));
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                        required
                                    />
                                    {(whyGreenData.keys || []).length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWhyGreenKey(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
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

            {showMediaPicker && (
                <MediaPicker
                    isOpen={showMediaPicker}
                    allowedTypes={['image']}
                    onSelect={(media) => {
                        setWhyGreenData(prev => ({
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