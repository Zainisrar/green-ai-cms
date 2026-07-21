'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EcosystemClientPartnerships } from '@/db/schema';
import { ecosystemClientPartnershipsApi } from '@/lib/api/ecosystemClientPartnerships';
import ImageUploadField from '@/components/shared/ImageUploadField';
import MediaPicker from '@/components/apps/media/MediaPicker';

export default function EditClientPartnershipsModals() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<EcosystemClientPartnerships | null>(null);
    const [activeTab, setActiveTab] = useState('whoWePartnerWith');
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{ type: string; index?: number } | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemClientPartnershipsApi.getById(id);
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load client partnerships data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setSaving(true);
        try {
            await ecosystemClientPartnershipsApi.update(id, {
                whoWePartnerWith: data.whoWePartnerWith,
                ourClientPartnership: data.ourClientPartnership,
                whatSetsGreenApart: data.whatSetsGreenApart,
                useCases: data.useCases,
                trustedBy: data.trustedBy
            });
            router.push('/ecosystem/client-partnerships');
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Failed to update client partnerships data');
        } finally {
            setSaving(false);
        }
    };

    // Helper functions for Who We Partner With
    const addPartnerItem = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whoWePartnerWith: {
                ...prev.whoWePartnerWith,
                items: [...prev.whoWePartnerWith.items, { clientType: '', valueDelivered: '' }]
            }
        } : null);
    };

    const updatePartnerItem = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whoWePartnerWith: {
                ...prev.whoWePartnerWith,
                items: prev.whoWePartnerWith.items.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }
        } : null);
    };

    const removePartnerItem = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whoWePartnerWith: {
                ...prev.whoWePartnerWith,
                items: prev.whoWePartnerWith.items.filter((_, i) => i !== index)
            }
        } : null);
    };

    // Helper functions for Our Client Partnership Items
    const addClientPartnershipItem = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourClientPartnership: {
                ...prev.ourClientPartnership,
                items: [...prev.ourClientPartnership.items, { title: '', description: '' }]
            }
        } : null);
    };

    const updateClientPartnershipItem = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourClientPartnership: {
                ...prev.ourClientPartnership,
                items: prev.ourClientPartnership.items.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }
        } : null);
    };

    const removeClientPartnershipItem = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            ourClientPartnership: {
                ...prev.ourClientPartnership,
                items: prev.ourClientPartnership.items.filter((_, i) => i !== index)
            }
        } : null);
    };

    // Helper functions for What Sets Green Apart
    const addGreenApartItem = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatSetsGreenApart: {
                ...prev.whatSetsGreenApart,
                items: [...prev.whatSetsGreenApart.items, { greenDelivers: '', othersPromise: '' }]
            }
        } : null);
    };

    const updateGreenApartItem = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatSetsGreenApart: {
                ...prev.whatSetsGreenApart,
                items: prev.whatSetsGreenApart.items.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }
        } : null);
    };

    const removeGreenApartItem = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            whatSetsGreenApart: {
                ...prev.whatSetsGreenApart,
                items: prev.whatSetsGreenApart.items.filter((_, i) => i !== index)
            }
        } : null);
    };

    // Helper functions for Use Cases
    const addUseCaseItem = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            useCases: {
                ...prev.useCases,
                items: [...prev.useCases.items, { img: { src: '', alt: '' }, title: '', reference: '' }]
            }
        } : null);
    };

    const updateUseCaseItem = (index: number, field: string, value: any) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            useCases: {
                ...prev.useCases,
                items: prev.useCases.items.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }
        } : null);
    };

    const removeUseCaseItem = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            useCases: {
                ...prev.useCases,
                items: prev.useCases.items.filter((_, i) => i !== index)
            }
        } : null);
    };

    // Helper functions for Trusted By Icons
    const addTrustedByIcon = () => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            trustedBy: {
                ...prev.trustedBy,
                icons: [...prev.trustedBy.icons, { src: '', alt: '' }]
            }
        } : null);
    };

    const updateTrustedByIcon = (index: number, field: string, value: string) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            trustedBy: {
                ...prev.trustedBy,
                icons: prev.trustedBy.icons.map((icon, i) => 
                    i === index ? { ...icon, [field]: value } : icon
                )
            }
        } : null);
    };

    const updateTrustedByIconComplete = (index: number, value: { src: string; alt: string }) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            trustedBy: {
                ...prev.trustedBy,
                icons: prev.trustedBy.icons.map((icon, i) => 
                    i === index ? value : icon
                )
            }
        } : null);
    };

    const removeTrustedByIcon = (index: number) => {
        if (!data) return;
        setData(prev => prev ? {
            ...prev,
            trustedBy: {
                ...prev.trustedBy,
                icons: prev.trustedBy.icons.filter((_, i) => i !== index)
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
        { id: 'whoWePartnerWith', label: 'Who We Partner With' },
        { id: 'ourClientPartnership', label: 'Our Client Partnership' },
        { id: 'whatSetsGreenApart', label: 'What Sets Green Apart' },
        { id: 'useCases', label: 'Use Cases' },
        { id: 'trustedBy', label: 'Trusted By' }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Client Partnerships - Modals</h1>
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
                {/* Who We Partner With Tab */}
                {activeTab === 'whoWePartnerWith' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Who We Partner With</h2>
                        
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.whoWePartnerWith.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        whoWePartnerWith: { ...prev.whoWePartnerWith, title: e.target.value }
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
                                    value={data.whoWePartnerWith.subHeadline}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        whoWePartnerWith: { ...prev.whoWePartnerWith, subHeadline: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Partner Items
                                </label>
                                <button
                                    type="button"
                                    onClick={addPartnerItem}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Item
                                </button>
                            </div>
                            {data.whoWePartnerWith.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Client Type"
                                            value={item.clientType}
                                            onChange={(e) => updatePartnerItem(index, 'clientType', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Value Delivered"
                                            value={item.valueDelivered}
                                            onChange={(e) => updatePartnerItem(index, 'valueDelivered', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePartnerItem(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Our Client Partnership Tab */}
                {activeTab === 'ourClientPartnership' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Our Client Partnership</h2>
                        
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.ourClientPartnership.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        ourClientPartnership: { ...prev.ourClientPartnership, title: e.target.value }
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
                                    value={data.ourClientPartnership.subHeadline}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        ourClientPartnership: { ...prev.ourClientPartnership, subHeadline: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={data.ourClientPartnership.description}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        ourClientPartnership: { ...prev.ourClientPartnership, description: e.target.value }
                                    } : null)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <ImageUploadField
                                    label="Partnership Image"
                                    value={data.ourClientPartnership.img}
                                    onChange={(value) => setData(prev => prev ? {
                                        ...prev,
                                        ourClientPartnership: { 
                                            ...prev.ourClientPartnership, 
                                            img: value
                                        }
                                    } : null)}
                                    folder="client-partnerships"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMediaPickerTarget({ type: 'ourClientPartnership' });
                                        setShowMediaPicker(true);
                                    }}
                                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                >
                                    Browse Media Library
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quote Text
                                    </label>
                                    <textarea
                                        value={data.ourClientPartnership.quote.text}
                                        onChange={(e) => setData(prev => prev ? {
                                            ...prev,
                                            ourClientPartnership: { 
                                                ...prev.ourClientPartnership, 
                                                quote: { ...prev.ourClientPartnership.quote, text: e.target.value }
                                            }
                                        } : null)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quote Highlighted
                                    </label>
                                    <textarea
                                        value={data.ourClientPartnership.quote.highlighted}
                                        onChange={(e) => setData(prev => prev ? {
                                            ...prev,
                                            ourClientPartnership: { 
                                                ...prev.ourClientPartnership, 
                                                quote: { ...prev.ourClientPartnership.quote, highlighted: e.target.value }
                                            }
                                        } : null)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Partnership Items
                                </label>
                                <button
                                    type="button"
                                    onClick={addClientPartnershipItem}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Item
                                </button>
                            </div>
                            {data.ourClientPartnership.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded-lg">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={item.title}
                                            onChange={(e) => updateClientPartnershipItem(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <textarea
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => updateClientPartnershipItem(index, 'description', e.target.value)}
                                            rows={3}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeClientPartnershipItem(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* What Sets Green Apart Tab */}
                {activeTab === 'whatSetsGreenApart' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">What Sets Green Apart</h2>
                        
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.whatSetsGreenApart.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        whatSetsGreenApart: { ...prev.whatSetsGreenApart, title: e.target.value }
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
                                    value={data.whatSetsGreenApart.subHeadline}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        whatSetsGreenApart: { ...prev.whatSetsGreenApart, subHeadline: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Comparison Items
                                </label>
                                <button
                                    type="button"
                                    onClick={addGreenApartItem}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Item
                                </button>
                            </div>
                            {data.whatSetsGreenApart.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Green Delivers
                                        </label>
                                        <textarea
                                            value={item.greenDelivers}
                                            onChange={(e) => updateGreenApartItem(index, 'greenDelivers', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Others Promise
                                        </label>
                                        <div className="flex gap-2">
                                            <textarea
                                                value={item.othersPromise}
                                                onChange={(e) => updateGreenApartItem(index, 'othersPromise', e.target.value)}
                                                rows={3}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGreenApartItem(index)}
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

                {/* Use Cases Tab */}
                {activeTab === 'useCases' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.useCases.title}
                                onChange={(e) => setData(prev => prev ? {
                                    ...prev,
                                    useCases: { ...prev.useCases, title: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Use Case Items
                                </label>
                                <button
                                    type="button"
                                    onClick={addUseCaseItem}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Item
                                </button>
                            </div>
                            {data.useCases.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded-lg">
                                    <div>
                                        <ImageUploadField
                                            label={`Use Case Image ${index + 1}`}
                                            value={item.img}
                                            onChange={(value) => updateUseCaseItem(index, 'img', value)}
                                            folder="client-partnerships/use-cases"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMediaPickerTarget({ type: 'useCase', index });
                                                setShowMediaPicker(true);
                                            }}
                                            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                        >
                                            Browse Media Library
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateUseCaseItem(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Reference
                                            </label>
                                            <input
                                                type="text"
                                                value={item.reference}
                                                onChange={(e) => updateUseCaseItem(index, 'reference', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeUseCaseItem(index)}
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

                {/* Trusted By Tab */}
                {activeTab === 'trustedBy' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Trusted By</h2>
                        
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={data.trustedBy.title}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        trustedBy: { ...prev.trustedBy, title: e.target.value }
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
                                    value={data.trustedBy.subHeadline}
                                    onChange={(e) => setData(prev => prev ? {
                                        ...prev,
                                        trustedBy: { ...prev.trustedBy, subHeadline: e.target.value }
                                    } : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Icons
                                </label>
                                <button
                                    type="button"
                                    onClick={addTrustedByIcon}
                                    className="btn btn-outline-success btn-sm"
                                >
                                    Add Icon
                                </button>
                            </div>
                            {data.trustedBy.icons.map((icon, index) => (
                                <div key={index} className="mb-4 p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-sm font-medium text-gray-700">Company Icon {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeTrustedByIcon(index)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <ImageUploadField
                                        label={`Company Icon ${index + 1}`}
                                        value={icon}
                                        onChange={(value) => updateTrustedByIconComplete(index, value)}
                                        folder="client-partnerships/trusted-by"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMediaPickerTarget({ type: 'trustedBy', index });
                                            setShowMediaPicker(true);
                                        }}
                                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                    >
                                        Browse Media Library
                                    </button>
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
                    if (mediaPickerTarget) {
                        if (mediaPickerTarget.type === 'ourClientPartnership') {
                            setData(prev => prev ? {
                                ...prev,
                                ourClientPartnership: {
                                    ...prev.ourClientPartnership,
                                    img: { src: media, alt: '' }
                                }
                            } : null);
                        } else if (mediaPickerTarget.type === 'useCase' && mediaPickerTarget.index !== undefined) {
                            const items = [...data!.useCases.items];
                            items[mediaPickerTarget.index].img = { src: media, alt: '' };
                            setData(prev => prev ? {
                                ...prev,
                                useCases: { ...prev.useCases, items }
                            } : null);
                        } else if (mediaPickerTarget.type === 'trustedBy' && mediaPickerTarget.index !== undefined) {
                            const icons = [...data!.trustedBy.icons];
                            icons[mediaPickerTarget.index] = { src: media, alt: '' };
                            setData(prev => prev ? {
                                ...prev,
                                trustedBy: { ...prev.trustedBy, icons }
                            } : null);
                        }
                    }
                    setShowMediaPicker(false);
                    setMediaPickerTarget(null);
                }}
                onClose={() => {
                    setShowMediaPicker(false);
                    setMediaPickerTarget(null);
                }}
            />
        </div>
    );
}