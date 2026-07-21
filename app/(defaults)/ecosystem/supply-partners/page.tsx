'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemSupplyPartnersApi } from '@/lib/api/ecosystemSupplyPartners';
import { EcosystemSupplyPartners } from '@/db/schema';
import { useAuth } from '@/contexts/AuthContext';

export default function EcosystemSupplyPartnersPage() {
    const [data, setData] = useState<EcosystemSupplyPartners | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemSupplyPartnersApi.get();
            setData(result);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            // If it's a 404 (no data found), don't show it as an error
            if (err?.message?.includes('404') || err?.status === 404) {
                setData(null);
            } else {
                setError(err?.message || 'Failed to fetch data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: string) => {
        if (!data) return;

        const editRoutes: Record<string, string> = {
            'main-page': `/ecosystem/supply-partners/edit-main-page/${data.id}`,
            'global-sourcing-strategy': `/ecosystem/supply-partners/edit-global-sourcing-strategy/${data.id}`,
            'what-we-procure': `/ecosystem/supply-partners/edit-what-we-procure/${data.id}`,
            'how-become-green-supplier': `/ecosystem/supply-partners/edit-how-become-green-supplier/${data.id}`,
        };

        router.push(editRoutes[section]);
    };

    const handleCreate = () => {
        router.push('/ecosystem/supply-partners/create');
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
                    <p>Error: {error}</p>
                    <button onClick={fetchData} className="mt-2 btn btn-outline-danger btn-sm">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Supply Partners</h1>
                {user && (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleEdit('main-page')}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                        >
                            ✏️ Edit Main Page
                        </button>
                        <button
                            onClick={() => handleEdit('global-sourcing-strategy')}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                        >
                            🌍 Edit Global Strategy
                        </button>
                        <button
                            onClick={() => handleEdit('what-we-procure')}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                        >
                            📦 Edit Procurement
                        </button>
                        <button
                            onClick={() => handleEdit('how-become-green-supplier')}
                            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                        >
                            🤝 Edit Supplier Process
                        </button>
                    </div>
                )}
            </div>

            {data ? (
                <div className="space-y-8">
                    {/* Main Page Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Main Page</h2>
                            <button
                                onClick={() => handleEdit('main-page')}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                ✏️ Edit
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{data.mainPage?.title || 'No Title'}</h3>
                            <p className="text-gray-600 mb-2">{data.mainPage?.subHeadline || 'No Subtitle'}</p>
                            <p className="text-gray-700">{data.mainPage?.description?.text || 'No description'}</p>
                            {data.mainPage?.description?.highlighted && <p className="text-blue-600 font-semibold">{data.mainPage.description.highlighted}</p>}
                        </div>

                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Partner Spotlight</h4>
                            <p className="text-gray-600 mb-2">{data.mainPage?.partnerSpotlight?.text || 'No text'}</p>
                            <p className="text-sm text-gray-500">Icons: {data.mainPage?.partnerSpotlight?.icons?.length || 0}</p>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">CTAs</h4>
                            <p className="text-sm text-gray-500">{data.mainPage?.cta?.length || 0} call-to-action buttons</p>
                        </div>
                    </div>

                    {/* Global Sourcing Strategy Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Global Sourcing Strategy</h2>
                            <button
                                onClick={() => handleEdit('global-sourcing-strategy')}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                🌍 Edit
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{data.globalSourcingStrategy?.title || 'No Title'}</h3>
                            <h4 className="text-lg text-gray-700 mb-2">{data.globalSourcingStrategy?.headline || 'No Headline'}</h4>
                            <p className="text-gray-600 mb-4">{data.globalSourcingStrategy?.description || 'No description'}</p>
                            <div>
                                <h5 className="font-semibold text-gray-800 mb-2">Key Points:</h5>
                                <ul className="list-disc list-inside text-gray-600">
                                    {data.globalSourcingStrategy?.keyPoints?.map((point, index) => <li key={index}>{point}</li>) || <li>No key points</li>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* What We Procure Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">What We Procure</h2>
                            <button
                                onClick={() => handleEdit('what-we-procure')}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                📦 Edit
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{data.whatWeProcure?.title || 'No Title'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.whatWeProcure?.item?.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded">
                                        <h4 className="font-semibold text-gray-800">{item.category}</h4>
                                        <p className="text-gray-600">{item.example}</p>
                                    </div>
                                )) || <p className="text-gray-500 col-span-full">No procurement items</p>}
                            </div>
                        </div>
                    </div>

                    {/* How to Become Green Supplier Section */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">How to Become Green Supplier</h2>
                            <button
                                onClick={() => handleEdit('how-become-green-supplier')}
                                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                🤝 Edit
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{data.howBecomeGreenSupplier?.title || 'No Title'}</h3>
                            <p className="text-gray-600 mb-4">{data.howBecomeGreenSupplier?.subHeadline || 'No Subtitle'}</p>
                            <div className="space-y-3">
                                {data.howBecomeGreenSupplier?.item?.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded">
                                        <h4 className="font-semibold text-gray-800">Step {item.step}</h4>
                                        <p className="text-gray-600">{item.action}</p>
                                    </div>
                                )) || <p className="text-gray-500">No steps defined</p>}
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 bg-white p-4 rounded">
                        <p>Created: {new Date(data.createdAt).toLocaleString()}</p>
                        <p>Updated: {new Date(data.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Supply Partners</h1>
                    <p className="text-gray-600 mb-8">No data found. Create the first entry.</p>
                    {user && (
                        <button
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            ✨ Create New Supply Partners
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
