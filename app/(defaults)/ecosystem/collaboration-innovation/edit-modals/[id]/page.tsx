'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EcosystemCollaborationInnovation } from '@/db/schema';
import { ecosystemCollaborationInnovationApi } from '@/lib/api/ecosystemCollaborationInnovation';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function EditCollaborationInnovationModals() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<EcosystemCollaborationInnovation | null>(null);
    const [activeTab, setActiveTab] = useState('ourPhilosophy');
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemCollaborationInnovationApi.getById(id);
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load collaboration innovation data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setSaving(true);
        try {
            await ecosystemCollaborationInnovationApi.update(id, {
                ourPhilosophy: data.ourPhilosophy,
                whoWeCelebrateWith: data.whoWeCelebrateWith,
                innovationSpotlight: data.innovationSpotlight
            });
            router.push('/ecosystem/collaboration-innovation');
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Failed to update collaboration innovation data');
        } finally {
            setSaving(false);
        }
    };

    // Helper functions for Our Philosophy Keys
    const addPhilosophyKey = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourPhilosophy: {
                ...prev.ourPhilosophy,
                keys: [...prev.ourPhilosophy.keys, '']
            }
        } : null);
    };

    const updatePhilosophyKey = (index: number, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourPhilosophy: {
                ...prev.ourPhilosophy,
                keys: prev.ourPhilosophy.keys.map((key, i) => 
                    i === index ? value : key
                )
            }
        } : null);
    };

    const removePhilosophyKey = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourPhilosophy: {
                ...prev.ourPhilosophy,
                keys: prev.ourPhilosophy.keys.filter((_, i) => i !== index)
            }
        } : null);
    };

    // Helper functions for Who We Celebrate With
    const addCelebrateItem = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whoWeCelebrateWith: {
                ...prev.whoWeCelebrateWith,
                items: [...prev.whoWeCelebrateWith.items, { partnerType: '', engagementScope: '' }]
            }
        } : null);
    };

    const updateCelebrateItem = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whoWeCelebrateWith: {
                ...prev.whoWeCelebrateWith,
                items: prev.whoWeCelebrateWith.items.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }
        } : null);
    };

    const removeCelebrateItem = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whoWeCelebrateWith: {
                ...prev.whoWeCelebrateWith,
                items: prev.whoWeCelebrateWith.items.filter((_, i) => i !== index)
            }
        } : null);
    };

    // Helper functions for Innovation Spotlight
    const addSpotlightKey = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            innovationSpotlight: {
                ...prev.innovationSpotlight,
                keys: [...prev.innovationSpotlight.keys, { title: '', description: '' }]
            }
        } : null);
    };

    const updateSpotlightKey = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            innovationSpotlight: {
                ...prev.innovationSpotlight,
                keys: prev.innovationSpotlight.keys.map((key, i) => 
                    i === index ? { ...key, [field]: value } : key
                )
            }
        } : null);
    };

    const removeSpotlightKey = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            innovationSpotlight: {
                ...prev.innovationSpotlight,
                keys: prev.innovationSpotlight.keys.filter((_, i) => i !== index)
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

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Data Not Found</h1>
                    <button
                        onClick={() => router.back()}
                        className="btn btn-outline-secondary"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'ourPhilosophy', label: 'Our Philosophy' },
        { id: 'whoWeCelebrateWith', label: 'Who We Celebrate With' },
        { id: 'innovationSpotlight', label: 'Innovation Spotlight' }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Collaboration & Innovation - Modals</h1>
                <button
                    onClick={() => router.back()}
                    className="btn btn-outline-secondary btn-sm"
                >
                    Back
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Our Philosophy Tab */}
                {activeTab === 'ourPhilosophy' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Our Philosophy</h2>
                        
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.ourPhilosophy.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        ourPhilosophy: { ...prev.ourPhilosophy, title: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sub Headline
                                </label>
                                <input
                                    type="text"
                                    value={data.ourPhilosophy.subHeadline}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        ourPhilosophy: { ...prev.ourPhilosophy, subHeadline: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <ImageUploadField
                                    label="Philosophy Image"
                                    value={data.ourPhilosophy.img}
                                    onChange={(value) => setData(prev => prev ? {
                                        ...prev,
                                        ourPhilosophy: { 
                                            ...prev.ourPhilosophy, 
                                            img: value
                                        }
                                    } : null)}
                                    folder="collaboration-innovation"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description Text
                                    </label>
                                    <textarea
                                        value={data.ourPhilosophy.description.text}
                                        onChange={(e) => setData(prev => prev ? {
                                            ...prev,
                                            ourPhilosophy: { 
                                                ...prev.ourPhilosophy, 
                                                description: { ...prev.ourPhilosophy.description, text: e.target.value }
                                            }
                                        } : null)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description Highlighted
                                    </label>
                                    <textarea
                                        value={data.ourPhilosophy.description.highlighted}
                                        onChange={(e) => setData(prev => prev ? {
                                            ...prev,
                                            ourPhilosophy: { 
                                                ...prev.ourPhilosophy, 
                                                description: { ...prev.ourPhilosophy.description, highlighted: e.target.value }
                                            }
                                        } : null)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Key Points
                                </label>
                                <button
                                    type="button"
                                    onClick={addPhilosophyKey}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Key Point
                                </button>
                            </div>
                            {data.ourPhilosophy.keys.map((key, index) => (
                                <div key={index} className="flex gap-4 mb-4 p-4 border rounded-lg">
                                    <input
                                        type="text"
                                        placeholder="Key Point"
                                        value={key}
                                        onChange={(e) => updatePhilosophyKey(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhilosophyKey(index)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Who We Celebrate With Tab */}
                {activeTab === 'whoWeCelebrateWith' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Who We Celebrate With</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.whoWeCelebrateWith.title}
                                onChange={(e) => setData(prev => prev ? {
                                    ...prev,
                                    whoWeCelebrateWith: { ...prev.whoWeCelebrateWith, title: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Partner Items
                                </label>
                                <button
                                    type="button"
                                    onClick={addCelebrateItem}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Item
                                </button>
                            </div>
                            {data.whoWeCelebrateWith.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Partner Type
                                        </label>
                                        <input
                                            type="text"
                                            value={item.partnerType}
                                            onChange={(e) => updateCelebrateItem(index, 'partnerType', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Engagement Scope
                                        </label>
                                        <div className="flex gap-2">
                                            <textarea
                                                value={item.engagementScope}
                                                onChange={(e) => updateCelebrateItem(index, 'engagementScope', e.target.value)}
                                                rows={3}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeCelebrateItem(index)}
                                                className="btn btn-outline-danger btn-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Innovation Spotlight Tab */}
                {activeTab === 'innovationSpotlight' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Innovation Spotlight</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.innovationSpotlight.title}
                                onChange={(e) => setData(prev => prev ? {
                                    ...prev,
                                    innovationSpotlight: { ...prev.innovationSpotlight, title: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Innovation Keys
                                </label>
                                <button
                                    type="button"
                                    onClick={addSpotlightKey}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Key
                                </button>
                            </div>
                            {data.innovationSpotlight.keys.map((key, index) => (
                                <div key={index} className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={key.title}
                                            onChange={(e) => updateSpotlightKey(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={key.description}
                                                onChange={(e) => updateSpotlightKey(index, 'description', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeSpotlightKey(index)}
                                                className="btn btn-outline-danger btn-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn btn-outline-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <MediaPicker
                isOpen={showMediaPicker}
                allowedTypes={['image']}
                onSelect={(media) => {
                    setData(prev => prev ? {
                        ...prev,
                        ourPhilosophy: {
                            ...prev.ourPhilosophy,
                            img: { src: media, alt: '' }
                        }
                    } : null);
                    setShowMediaPicker(false);
                }}
                onClose={() => setShowMediaPicker(false)}
            />
        </div>
    );
}