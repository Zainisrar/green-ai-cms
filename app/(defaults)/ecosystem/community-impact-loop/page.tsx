'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemCommunityImpactLoopApi } from '@/lib/api/ecosystemCommunityImpactLoop';
import type { EcosystemCommunityImpactLoop } from '@/db/schema';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityImpactLoopPage() {
    const [data, setData] = useState<EcosystemCommunityImpactLoop | null>(null);
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
            const result = await ecosystemCommunityImpactLoopApi.getAll();
            console.log('Fetched data:', result);
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Community Impact Loop</h1>
                <div className="space-x-4">
                    {!data && user && (
                        <button
                            onClick={() => router.push('/ecosystem/community-impact-loop/create')}
                            className="border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-full transition-colors duration-200"
                        >
                            Create New
                        </button>
                    )}
                </div>
            </div>

            {!data ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No community impact loop data found.</p>
                    {user && (
                        <button
                            onClick={() => router.push('/ecosystem/community-impact-loop/create')}
                            className="border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-full transition-colors duration-200"
                        >
                            Create First Entry
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {data.mainPage.title}
                            </h2>
                            {user && (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => router.push(`/ecosystem/community-impact-loop/edit-main-page/${data.id}`)}
                                        className="border border-green-300 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-full text-sm transition-colors duration-200"
                                    >
                                        Edit Main Page
                                    </button>
                                    <button
                                        onClick={() => router.push(`/ecosystem/community-impact-loop/edit-green-community-impact-loop/${data.id}`)}
                                        className="border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-full text-sm transition-colors duration-200"
                                    >
                                        Edit Green Community Impact Loop
                                    </button>
                                    <button
                                        onClick={() => router.push(`/ecosystem/community-impact-loop/edit-how-loop-works/${data.id}`)}
                                        className="border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-full text-sm transition-colors duration-200"
                                    >
                                        Edit How Loop Works
                                    </button>
                                    <button
                                        onClick={() => router.push(`/ecosystem/community-impact-loop/edit-measured-impact/${data.id}`)}
                                        className="border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-2 px-4 rounded-full text-sm transition-colors duration-200"
                                    >
                                        Edit Measured Impact
                                    </button>
                                    <button
                                        onClick={() => router.push(`/ecosystem/community-impact-loop/edit-join-the-loop/${data.id}`)}
                                        className="border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium py-2 px-4 rounded-full text-sm transition-colors duration-200"
                                    >
                                        Edit Join The Loop
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Main Page */}
                            <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2 text-blue-600">Main Page</h3>
                                <p className="text-sm text-gray-600 mb-2"><strong>Title:</strong> {data.mainPage.title}</p>
                                <p className="text-sm text-gray-600 mb-2"><strong>Subtitle:</strong> {data.mainPage.subHeadline}</p>
                                <p className="text-sm text-gray-600 mb-2"><strong>Description:</strong> 
                                    {typeof data.mainPage.description === 'string' 
                                        ? data.mainPage.description 
                                        : (data.mainPage.description as any)?.text || ''
                                    }
                                </p>
                                <p className="text-sm text-gray-600 mb-2"><strong>Quote:</strong> 
                                    {Array.isArray(data.mainPage.quote) 
                                        ? data.mainPage.quote[0]?.text || '' 
                                        : (data.mainPage.quote as any)?.text || ''
                                    }
                                </p>
                                <p className="text-sm text-gray-600"><strong>CTAs:</strong> {data.mainPage.cta.length} items</p>
                            </div>

                            {/* Green Community Impact Loop */}
                            <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2 text-green-600">Green Community Impact Loop</h3>
                                <p className="text-sm text-gray-600 mb-2"><strong>Title:</strong> {data.greenCommunityImpactLoop.title}</p>
                                <p className="text-sm text-gray-600 mb-2"><strong>Steps:</strong> 
                                    {(data.greenCommunityImpactLoop as any).steps 
                                        ? (data.greenCommunityImpactLoop as any).steps.length 
                                        : (data.greenCommunityImpactLoop as any).keys?.length || 0
                                    } items
                                </p>
                            </div>

                            {/* How Loop Works */}
                            <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2 text-purple-600">How Loop Works</h3>
                                <p className="text-sm text-gray-600 mb-2"><strong>Title:</strong> {data.howLoopWorks.title}</p>
                                <p className="text-sm text-gray-600"><strong>Process:</strong> 
                                    {(data.howLoopWorks as any).process 
                                        ? (data.howLoopWorks as any).process.length 
                                        : (data.howLoopWorks as any).items?.length || 0
                                    } items
                                </p>
                            </div>

                            {/* Measured Impact */}
                            <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2 text-orange-600">Measured Impact</h3>
                                <p className="text-sm text-gray-600 mb-2"><strong>Title:</strong> {data.measuredImpact.title}</p>
                                <p className="text-sm text-gray-600 mb-2"><strong>Metrics:</strong> 
                                    {(data.measuredImpact as any).metrics 
                                        ? (data.measuredImpact as any).metrics.length 
                                        : (data.measuredImpact as any).items?.length || 0
                                    } items
                                </p>
                            </div>

                            {/* Join The Loop */}
                            <div className="border rounded-lg p-4 md:col-span-2">
                                <h3 className="text-lg font-semibold mb-2 text-teal-600">Join The Loop</h3>
                                <p className="text-sm text-gray-600 mb-2"><strong>Title:</strong> {data.joinTheLoop.title}</p>
                                <p className="text-sm text-gray-600 mb-2"><strong>How to Join:</strong> 
                                    {(data.joinTheLoop as any).howToJoin 
                                        ? (data.joinTheLoop as any).howToJoin.length 
                                        : 0
                                    } steps
                                </p>
                                <p className="text-sm text-gray-600"><strong>Description:</strong> 
                                    {(data.joinTheLoop as any).description || 'No description available'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 text-sm text-gray-500">
                            <p>Created: {new Date(data.createdAt).toLocaleDateString()}</p>
                            <p>Updated: {new Date(data.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}