'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemTechnologyInnovationAlliancesApi } from '@/lib/api/ecosystemTechnologyInnovationAlliances';
import type { EcosystemTechnologyInnovationAlliances } from '@/db/schema';

export default function TechnologyInnovationAlliancesPage() {
    const [data, setData] = useState<EcosystemTechnologyInnovationAlliances | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemTechnologyInnovationAlliancesApi.getAll();
            
            // If no record exists, redirect to create
            if (!result || result.length === 0) {
                router.push('/ecosystem/technology-innovation-alliances/create');
                return;
            }
            
            // Use the first (and should be only) record
            setData(result[0]);
        } catch (err) {
            setError('Failed to fetch technology innovation alliances data');
            console.error('Error:', err);
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

    if (error || !data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600 text-xl">{error || 'No data found'}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Technology Innovation Alliances
                </h1>
                <p className="text-gray-600">Manage your technology innovation alliances content</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{data.mainPage.title}</h2>
                    <p className="text-gray-600 text-sm">
                        Last updated: {new Date(data.updatedAt).toLocaleDateString()}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => router.push(`/ecosystem/technology-innovation-alliances/edit-main-page/${data.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Main Page
                    </button>
                    
                    <button
                        onClick={() => router.push(`/ecosystem/technology-innovation-alliances/edit-modals/${data.id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Edit Modals
                    </button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Total Modals:</span>
                            <span className="ml-2 font-semibold">{data.modals?.length || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-2 font-semibold">{new Date(data.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Call to Actions Section */}
                {data.mainPage.cta && data.mainPage.cta.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Call to Actions</h3>
                        <div className="space-y-2">
                            {data.mainPage.cta.map((cta, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                    <span className="text-blue-600 font-medium">{cta.text}</span>
                                    <span className="text-gray-500">→</span>
                                    <span className="text-gray-600">{cta.href}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}