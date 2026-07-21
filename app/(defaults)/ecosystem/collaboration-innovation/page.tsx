'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemCollaborationInnovation } from '@/db/schema';
import { ecosystemCollaborationInnovationApi } from '@/lib/api/ecosystemCollaborationInnovation';

export default function EcosystemCollaborationInnovationPage() {
    const [data, setData] = useState<EcosystemCollaborationInnovation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemCollaborationInnovationApi.get();
            setData(result);
        } catch (err) {
            setError('Failed to load collaboration innovation data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };



    const handleCreate = () => {
        router.push('/ecosystem/collaboration-innovation/create');
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
                    <p>{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-2 btn btn-outline-danger btn-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Collaboration & Innovation</h1>
                    <p className="text-gray-600 mb-8">No collaboration innovation data found.</p>
                    <button
                        onClick={handleCreate}
                        className="btn btn-primary"
                    >
                        Create New Collaboration & Innovation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Collaboration & Innovation</h1>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => router.push(`/ecosystem/collaboration-innovation/edit-main-page/${data.id}`)}
                        className="btn btn-outline-primary btn-sm"
                    >
                        Edit Main Page
                    </button>
                    <button
                        onClick={() => router.push(`/ecosystem/collaboration-innovation/edit-modals/${data.id}`)}
                        className="btn btn-outline-success btn-sm"
                    >
                        Edit Modals
                    </button>
                </div>
            </div>

            {/* Main Page Content */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.mainPage.title}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{data.mainPage.subHeadline}</h3>
                <div className="mb-6">
                    <p className="text-gray-700">
                        {data.mainPage.description.text}
                        <span className="font-semibold"> {data.mainPage.description.highlighted}</span>
                    </p>
                </div>
                
                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Quotes:</h4>
                    {data.mainPage.quote.map((quote, index) => (
                        <div key={index} className="mb-2">
                            <p className="text-gray-700">
                                {quote.text}
                                <span className="font-semibold"> {quote.highlighted}</span>
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Call to Actions:</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.mainPage.cta.map((cta, index) => (
                            <a
                                key={index}
                                href={cta.href}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {cta.text}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Philosophy */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.ourPhilosophy.title}</h2>
                <h3 className="text-xl text-gray-600 mb-4">{data.ourPhilosophy.subHeadline}</h3>
                
                {data.ourPhilosophy.img && (
                    <div className="mb-4">
                        <img 
                            src={data.ourPhilosophy.img.src} 
                            alt={data.ourPhilosophy.img.alt}
                            className="w-full max-w-md mx-auto rounded-lg"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <p className="text-gray-700">
                        {data.ourPhilosophy.description.text}
                        <span className="font-semibold"> {data.ourPhilosophy.description.highlighted}</span>
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {data.ourPhilosophy.keys.map((key, index) => (
                            <li key={index} className="text-gray-700">{key}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Who We Celebrate With */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{data.whoWeCelebrateWith.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.whoWeCelebrateWith.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{item.partnerType}</h4>
                            <p className="text-gray-700">{item.engagementScope}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Innovation Spotlight */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{data.innovationSpotlight.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.innovationSpotlight.keys.map((key, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{key.title}</h4>
                            <p className="text-gray-700">{key.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}