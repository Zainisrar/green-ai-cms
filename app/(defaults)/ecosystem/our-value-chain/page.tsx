'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemOurValueChain } from '@/db/schema';

export default function EcosystemOurValueChainPage() {
    const [data, setData] = useState<EcosystemOurValueChain | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ecosystem/our-value-chain');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (data && data.id) {
            router.push(`/ecosystem/our-value-chain/edit/${data.id}`);
        } else {
            router.push('/ecosystem/our-value-chain/create');
        }
    };

    const handleDelete = async () => {
        if (!data || !data.id) return;
        
        if (confirm('Are you sure you want to delete this data?')) {
            try {
                const response = await fetch(`/api/ecosystem/our-value-chain/${data.id}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete data');
                }
                
                await fetchData(); // Refresh data
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Ecosystem - Our Value Chain
                </h1>
                <div className="space-x-4">
                    <button
                        onClick={handleEdit}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {data && data.id ? 'Edit' : 'Create'}
                    </button>
                    {data && data.id && (
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {data ? (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            {data.title || 'No Title'}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {data.subHeadline || 'No Subtitle'}
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-700">
                                {data.description?.text || 'No description text'}
                            </p>
                            {data.description?.highlighted && (
                                <p className="text-blue-600 font-semibold mt-2">
                                    Highlighted: {data.description.highlighted}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Quotes ({data.quote?.length || 0})
                        </h3>
                        <div className="space-y-2">
                            {data.quote?.map((quote, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    <p className="text-gray-700">{quote.text}</p>
                                    {quote.highlighted && (
                                        <p className="text-blue-600 font-semibold">
                                            Highlighted: {quote.highlighted}
                                        </p>
                                    )}
                                </div>
                            )) || <p className="text-gray-500">No quotes</p>}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Call to Actions ({data.cta?.length || 0})
                        </h3>
                        <div className="space-y-2">
                            {data.cta?.map((cta, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    <p className="text-gray-700">{cta.text}</p>
                                    <a 
                                        href={cta.href} 
                                        className="text-blue-600 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {cta.href}
                                    </a>
                                </div>
                            )) || <p className="text-gray-500">No CTAs</p>}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Value Chain Strip ({data.valueChainStrip?.length || 0})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.valueChainStrip?.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded">
                                    {item.img && (
                                        <img 
                                            src={item.img.src} 
                                            alt={item.img.alt}
                                            className="w-full h-32 object-cover rounded mb-2"
                                        />
                                    )}
                                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                    <p className="text-gray-600 text-sm">{item.description}</p>
                                </div>
                            )) || <p className="text-gray-500 col-span-full">No value chain items</p>}
                        </div>
                    </div>

                    <div className="text-sm text-gray-500">
                        <p>Created: {new Date(data.createdAt).toLocaleString()}</p>
                        <p>Updated: {new Date(data.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                    <p className="text-gray-500 mb-4">No data found</p>
                    <button
                        onClick={() => router.push('/ecosystem/our-value-chain/create')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create New
                    </button>
                </div>
            )}
        </div>
    );
}