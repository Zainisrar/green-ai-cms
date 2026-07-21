'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemCommunityImpactLoopApi } from '@/lib/api/ecosystemCommunityImpactLoop';
import type { EcosystemCommunityImpactLoop, JoinTheLoop } from '@/db/schema';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

interface Props {
    params: { id: string };
}

export default function EditJoinTheLoop({ params }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EcosystemCommunityImpactLoop | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const [joinTheLoop, setJoinTheLoop] = useState<JoinTheLoop>({
        title: '',
        img: {
            src: '',
            alt: '',
        },
        quote: {
            text: '',
            highlighted: '',
        },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemCommunityImpactLoopApi.getById(parseInt(params.id));
            setData(result);

            // Handle data structure mismatch
            const apiData = result.joinTheLoop;

            setJoinTheLoop({
                title: apiData.title || '',
                img: apiData.img || {
                    src: '',
                    alt: '',
                },
                quote: apiData.quote || {
                    text: (apiData as any).description || '',
                    highlighted: '',
                },
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
                joinTheLoop,
            });
            router.push('/ecosystem/community-impact-loop');
        } catch (err) {
            setError('Failed to update join the loop');
            console.error('Error updating data:', err);
        } finally {
            setSaving(false);
        }
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Join The Loop</h1>
                <button onClick={() => router.back()} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Back
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-teal-600">Join The Loop Content</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={joinTheLoop.title}
                                onChange={(e) => setJoinTheLoop((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>

                        <div>
                            <ImageUploadField
                                label="Image"
                                value={joinTheLoop.img}
                                onChange={(img: { src: string; alt: string }) =>
                                    setJoinTheLoop((prev) => ({
                                        ...prev,
                                        img,
                                    }))
                                }
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowMediaPicker(true)}
                                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                Browse Media Library
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
                                <textarea
                                    value={joinTheLoop.quote.text}
                                    onChange={(e) =>
                                        setJoinTheLoop((prev) => ({
                                            ...prev,
                                            quote: { ...prev.quote, text: e.target.value },
                                        }))
                                    }
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quote Highlighted</label>
                                <textarea
                                    value={joinTheLoop.quote.highlighted}
                                    onChange={(e) =>
                                        setJoinTheLoop((prev) => ({
                                            ...prev,
                                            quote: { ...prev.quote, highlighted: e.target.value },
                                        }))
                                    }
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <MediaPicker
                isOpen={showMediaPicker}
                allowedTypes={['image']}
                onSelect={(media) => {
                    setJoinTheLoop(prev => ({
                        ...prev,
                        img: { src: media, alt: '' }
                    }));
                    setShowMediaPicker(false);
                }}
                onClose={() => setShowMediaPicker(false)}
            />
        </div>
    );
}
