'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ecosystemKeySupplyCategoriesApi } from '@/lib/api/ecosystemKeySupplyCategories';
import { EcosystemKeySupplyCategories } from '@/db/schema';

export default function EcosystemKeySupplyCategoriesPage() {
    const [data, setData] = useState<EcosystemKeySupplyCategories | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await ecosystemKeySupplyCategoriesApi.get();
            setData(result);
        } catch (err) {
            setError('Failed to load key supply categories data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
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
                <h1 className="text-3xl font-bold text-gray-800">Key Supply Categories</h1>
                <div className="flex flex-wrap gap-3">
                    {!data ? (
                        <button
                            onClick={() => router.push('/ecosystem/key-supply-categories/create')}
                            className="btn btn-primary"
                        >
                            Create New
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push(`/ecosystem/key-supply-categories/edit-main-page/${data.id}`)}
                                className="btn btn-outline-primary btn-sm"
                            >
                                Edit Main Page
                            </button>
                            <button
                                onClick={() => router.push(`/ecosystem/key-supply-categories/edit-modals/${data.id}`)}
                                className="btn btn-outline-success btn-sm"
                            >
                                Edit Modals
                            </button>
                        </>
                    )}
                </div>
            </div>

            {data ? (
                <div className="space-y-8">
                    {/* Main Page Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">Main Page</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700">Title:</h3>
                                <p className="text-gray-900">{data.mainPage.title}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Sub Headline:</h3>
                                <p className="text-gray-900">{data.mainPage.subHeadline}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Description:</h3>
                                <div className="ml-4 border-l-4 border-gray-300 pl-4">
                                    <p className="text-gray-900">{data.mainPage.description.text}</p>
                                    <p className="text-primary font-medium">{data.mainPage.description.highlighted}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">Quote:</h3>
                                <div className="ml-4 border-l-4 border-gray-300 pl-4">
                                    <p className="text-gray-900">{data.mainPage.quote.text}</p>
                                    <p className="text-primary font-medium">{data.mainPage.quote.highlighted}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700">CTAs:</h3>
                                {data.mainPage.cta.map((c, index) => (
                                    <div key={index} className="ml-4">
                                        <a href={c.href} className="text-blue-600 hover:underline">{c.text}</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modals Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-4">Modals</h2>
                        <div className="space-y-6">
                            {data.modals.map((modal, modalIndex) => (
                                <div key={modalIndex} className="border border-gray-200 p-4 rounded">
                                    <h3 className="text-lg font-semibold mb-3">Modal {modalIndex + 1}: {modal.title}</h3>
                                    <div className="space-y-3">
                                        {modal.item.map((item, itemIndex) => (
                                            <div key={itemIndex} className="bg-gray-50 p-3 rounded">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-medium text-gray-700">Component:</h4>
                                                        <p className="text-gray-900">{item.component}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-700">Technical Notes:</h4>
                                                        <p className="text-gray-900">{item.technicalNotes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No key supply categories data found.</p>
                    <button
                        onClick={() => router.push('/ecosystem/key-supply-categories/create')}
                        className="btn btn-primary"
                    >
                        Create New Key Supply Categories
                    </button>
                </div>
            )}
        </div>
    );
}