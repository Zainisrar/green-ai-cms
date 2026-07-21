'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemHandbookApi } from '@/lib/api/ecosystemHandbook';
import type { EcosystemHandbook } from '@/db/schema';

export default function EcosystemHandbookPage() {
    const [data, setData] = useState<EcosystemHandbook | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemHandbookApi.get();
            setData(result);
        } catch (err: any) {
            console.error('Error fetching ecosystem handbook:', err);
            // If it's a 404 (no data found), don't show it as an error
            if (err?.response?.status === 404) {
                setData(null);
            } else {
                const errorMessage = err?.response?.data?.error || err?.message || 'Failed to load ecosystem handbook data';
                setError(errorMessage);
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
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Ecosystem Handbook</h1>
                <div className="flex flex-wrap gap-3">
                    {!data ? (
                        <button onClick={() => router.push('/ecosystem/handbook/create')} className="btn btn-primary">
                            Create New
                        </button>
                    ) : (
                        <>
                            <button onClick={() => router.push(`/ecosystem/handbook/edit-main-page/${data.id}`)} className="btn btn-outline-primary btn-sm">
                                Edit Main Page
                            </button>
                            <button onClick={() => router.push(`/ecosystem/handbook/edit-modals/${data.id}`)} className="btn btn-outline-success btn-sm">
                                Edit Modals
                            </button>
                        </>
                    )}
                </div>
            </div>

            {data ? (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{data.mainPage.title}</h2>
                        <p className="text-lg text-gray-600 mb-4">{data.mainPage.subHeadline}</p>
                        <p className="text-gray-700 mb-4">{data.mainPage.description}</p>
                    </div>

                    {/* Main Page Quotes */}
                    {data.mainPage.quote && data.mainPage.quote.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Quotes</h3>
                            <div className="space-y-2">
                                {data.mainPage.quote.map((quote, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded">
                                        <p className="text-gray-700">
                                            {quote.text} <span className="font-semibold text-blue-600">{quote.highlighted}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Page CTAs */}
                    {data.mainPage.cta && data.mainPage.cta.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Call to Actions</h3>
                            <div className="space-y-2">
                                {data.mainPage.cta.map((cta, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded">
                                        <a href={cta.href} className="text-blue-600 hover:text-blue-800 font-medium">
                                            {cta.text}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Our Procurement Ethos */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Our Procurement Ethos</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <h4 className="font-medium text-gray-800 mb-2">{data.ourProcurementEthos.title}</h4>
                            <p className="text-gray-700 mb-3">{data.ourProcurementEthos.description}</p>
                            {data.ourProcurementEthos.keys && data.ourProcurementEthos.keys.length > 0 && (
                                <ul className="list-disc list-inside space-y-1">
                                    {data.ourProcurementEthos.keys.map((key, index) => (
                                        <li key={index} className="text-gray-600">
                                            {key}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Code of Conduct */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Code of Conduct</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <h4 className="font-medium text-gray-800 mb-3">{data.codeOfConduct.title}</h4>
                            {data.codeOfConduct.item && data.codeOfConduct.item.length > 0 && (
                                <div className="space-y-3">
                                    {data.codeOfConduct.item.map((item, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                                            <h5 className="font-medium text-gray-800">{item.category}</h5>
                                            <p className="text-gray-600">{item.requiredStandard}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 mt-6">
                        <p>Created: {new Date(data.createdAt).toLocaleDateString()}</p>
                        <p>Updated: {new Date(data.updatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No ecosystem handbook data found.</p>
                    <button onClick={() => router.push('/ecosystem/handbook/create')} className="btn btn-primary">
                        Create New Ecosystem Handbook
                    </button>
                </div>
            )}
        </div>
    );
}
